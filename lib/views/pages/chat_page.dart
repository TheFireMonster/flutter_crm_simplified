import 'package:flutter/material.dart';
import 'package:grouped_list/grouped_list.dart';
import 'package:flutter_crm/widgets/chat/messages.dart';
import 'package:intl/intl.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';


class ChatPage extends StatefulWidget {
  final String? conversationId;
  const ChatPage({super.key, this.conversationId});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  bool chatGptActive = false;

  Future<void> fetchChatGptStatus() async {
    if (linkId == null) return;
    final response = await http.get(
      Uri.parse('/chat/conversations/$linkId'),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        chatGptActive = data['chatGptActive'] ?? false;
      });
    }
  }

  Future<void> toggleChatGpt(bool value) async {
    if (linkId == null) return;
    final response = await http.patch(
      Uri.parse('/chat/conversations/$linkId'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'chatGptActive': value}),
    );
    if (response.statusCode == 200) {
      setState(() => chatGptActive = value);
    }
  }
  Future<void> loadMessageHistory(String conversationId) async {
    final token = accessTokens[conversationId];
    if (token == null) {
      debugPrint('⚠️ Token não disponível para carregar histórico de $conversationId');
      return;
    }
    try {
      final response = await http.get(
        Uri.parse('/chat/history/$conversationId/$token'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          messages = data.map((msg) {
            DateTime msgDate;
            try {
              msgDate = DateTime.parse(msg['createdAt']).toLocal();
            } catch (e) {
              msgDate = DateTime.now();
            }
            return Message(
              text: msg['content'],
              date: msgDate,
              isSentByMe: (msg['sender'] == 'staff'),
            );
          }).toList();
        });
      } else if (response.statusCode == 403) {
        debugPrint('❌ Token inválido para conversa $conversationId');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar histórico: ${e.toString()}')),
        );
      }
    }
  }
  final TextEditingController _controller = TextEditingController();
  bool isDrawerOpen = false;
  String? generatedCustomerId;
  List<String> generatedChatLinks = [];
  Map<String, String> customerNames = {};
  Map<String, dynamic> customerIds = {};
  Map<String, String> accessTokens = {};
  Future<void> loadChatLinks() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      generatedChatLinks = prefs.getStringList('chatLinks') ?? [];
      
      final namesJson = prefs.getString('customerNames');
      if (namesJson != null) {
        customerNames = Map<String, String>.from(jsonDecode(namesJson));
      }
      final idsJson = prefs.getString('customerIds');
      if (idsJson != null) {
        customerIds = Map<String, dynamic>.from(jsonDecode(idsJson));
      }
      final tokensJson = prefs.getString('accessTokens');
      if (tokensJson != null) {
        accessTokens = Map<String, String>.from(jsonDecode(tokensJson));
      }
    });
  }

  Future<void> saveChatLinks() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('chatLinks', generatedChatLinks);
    await prefs.setString('customerNames', jsonEncode(customerNames));
    await prefs.setString('customerIds', jsonEncode(customerIds));
    await prefs.setString('accessTokens', jsonEncode(accessTokens));
  }
  bool isGeneratingLink = false;
  final TextEditingController _customerNameController = TextEditingController();
  late io.Socket socket;
  bool isSocketConnected = false;
  bool isSocketConnecting = true; // Novo estado para mostrar "Conectando..."
  List<Message> messages = [];
  Timer? _connectionCheckTimer;

  final Set<String> _receivedMessageIds = {};
  bool isSomeoneTyping = false;
  String typingUser = '';
  String? url;
  String? linkId;

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  @override
  void initState() {
    super.initState();
    connectToServer();
    loadChatLinks();
    
    // Verifica periodicamente o estado da conexão
    _connectionCheckTimer = Timer.periodic(Duration(seconds: 3), (timer) {
      if (mounted && socket.connected != isSocketConnected) {
        setState(() {
          isSocketConnected = socket.connected;
          isSocketConnecting = false; // Se está verificando, já passou da fase de "conectando"
        });
        debugPrint('🔄 Estado atualizado: ${socket.connected}');
      }
    });
    
    if (widget.conversationId != null && widget.conversationId!.isNotEmpty) {
      linkId = widget.conversationId;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _joinConversationIfNeeded();
      });
    }
  }

  @override
  void dispose() {
    _connectionCheckTimer?.cancel();
    try {
      socket.disconnect();
      socket.dispose();
    } catch (e) {
      debugPrint('Erro ao desconectar socket: $e');
    }
    _controller.dispose();
    _customerNameController.dispose();
    super.dispose();
  }

  void _joinConversationIfNeeded() {
    if (linkId == null) return;
    final token = accessTokens[linkId];
    if (token == null) {
      debugPrint('⚠️ Token não encontrado para conversa $linkId');
      return;
    }
    try {
      socket.emit('join_conversation', {'conversationId': linkId, 'token': token});
    } catch (e) {
      debugPrint('Erro ao entrar na conversa: $e');
    }
    loadMessageHistory(linkId!);
    fetchChatGptStatus();
  }

  void connectToServer() {
  final origin = Uri.base.origin;
  final serverUrl = (origin.isNotEmpty && origin.startsWith('http')) ? origin : 'http://localhost:3000';
  
    debugPrint('🔌 Conectando ao servidor: $serverUrl');

    socket = io.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    socket.onConnect((_){
      debugPrint('✅ Socket conectado!');
      if (mounted) setState(() {
        isSocketConnected = true;
        isSocketConnecting = false;
      });
      if (linkId != null) {
        final token = accessTokens[linkId];
        if (token != null) {
          try {
            socket.emit('join_conversation', {'conversationId': linkId, 'token': token});
            debugPrint('📨 Entrou na conversa: $linkId');
          } catch (e) {
            debugPrint('Erro ao entrar na conversa no connect: $e');
          }
        } else {
          debugPrint('⚠️ Token não disponível para $linkId');
        }
      }
    });

    socket.onConnectError((err){ 
      debugPrint('❌ Erro de conexão: $err');
      if (mounted) setState(() {
        isSocketConnected = false;
        isSocketConnecting = false;
      }); 
    });
    socket.onError((err){ 
      debugPrint('❌ Erro no socket: $err');
      if (mounted) setState(() {
        isSocketConnected = false;
        isSocketConnecting = false;
      }); 
    });
    socket.onDisconnect((_){ 
      debugPrint('🔌 Socket desconectado');
      if (mounted) setState(() {
        isSocketConnected = false;
        isSocketConnecting = false;
      }); 
    });

    socket.on('receive_message', (data) {
      final incomingId = data['id']?.toString() ?? '';
      if (incomingId.isNotEmpty && _receivedMessageIds.contains(incomingId)) {
        return;
      }
      DateTime msgDate;
      try {
        msgDate = DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()).toLocal();
      } catch (e) {
        msgDate = DateTime.now();
      }
      final message = Message(
        text: data['content'] ?? data['text'],
        date: msgDate,
        isSentByMe: (data['sender'] == 'staff'),
      );
  if (incomingId.isNotEmpty) _receivedMessageIds.add(incomingId);
      if ((data['sender'] ?? '') == 'staff') {
        setState(() {
          isSomeoneTyping = false;
          typingUser = '';
        });
      }
      setState(() {
        messages.add(message);
      });
    });

    socket.on('typing', (data) {
      final sender = data['sender'] ?? '';
      final done = data['done'] == true;
      if (sender != 'Staff') {
        if (done) {
          setState(() {
            isSomeoneTyping = false;
            typingUser = '';
          });
        } else {
          setState(() {
            isSomeoneTyping = true;
            typingUser = sender;
          });
          Future.delayed(Duration(seconds: 2), () {
            setState(() {
              isSomeoneTyping = false;
            });
          });
        }
      }
    });
  }

  int? _toNullableInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    final s = v.toString();
    return int.tryParse(s);
  }

        String generateCustomerId(String name) {
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        return '${name}_$timestamp';
      }

      Future<Map<String, dynamic>> fetchConversationInfo(String? customerId, String customerName) async {
    final parsed = _toNullableInt(customerId);
    final body = (parsed != null) ? {'customerId': parsed, 'customerName': customerName} : {'customerName': customerName};
        final response = await http.post(
          Uri.parse('/chat/conversations'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        );
        if (response.statusCode == 200 || response.statusCode == 201) {
          final contentType = response.headers['content-type'] ?? '';
          if (contentType.contains('application/json')) {
            try {
              return jsonDecode(response.body);
            } catch (e) {
              throw Exception('Erro ao decodificar JSON: $e');
            }
          } else {
            throw Exception('Resposta não é JSON. Content-Type: $contentType');
          }
        } else {
          String errorMsg = 'Erro ao carregar conversa: status ${response.statusCode}';
          if (response.body.isNotEmpty) {
            errorMsg += '\nCorpo da resposta: ${response.body}';
          }
          throw Exception(errorMsg);
        }
      }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          SideMenu(
            isDrawerOpen: isDrawerOpen,
            toggleDrawer: toggleDrawer,
            ),
          Container(
            height: MediaQuery.of(context).size.height,
            width: 300,
            color: Colors.lightGreen[100],
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    'Mensagens',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: _customerNameController,
                        decoration: InputDecoration(
                          labelText: 'Nome do cliente',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      SizedBox(height: 8),
                      ElevatedButton.icon(
                        icon: Icon(Icons.link, color: Colors.green[800]),
                        label: Text(isGeneratingLink ? 'Gerando...' : 'Gerar link de chat'),
                        onPressed: isGeneratingLink ? null : () async {
                          final messenger = ScaffoldMessenger.of(context);
                          final navigator = Navigator.of(context);

                          final name = _customerNameController.text.trim();
                          if (name.isEmpty) {
                            messenger.showSnackBar(
                              SnackBar(content: Text('Digite o nome do cliente.')),
                            );
                            return;
                          }

                          setState(() { isGeneratingLink = true; });
                          try {
                            final info = await fetchConversationInfo(null, name);
                            linkId = info['linkId'];
                            final accessToken = info['accessToken'];
                            final newLink = info['url'];
                            setState(() {
                              generatedChatLinks.add(newLink);
                              customerNames[linkId!] = name;
                              accessTokens[linkId!] = accessToken;
                              if (info.containsKey('customerId') && info['customerId'] != null) {
                                customerIds[linkId!] = info['customerId'];
                              }
                            });
                            try {
                              socket.emit('join_conversation', {'conversationId': linkId, 'token': accessToken});
                            } catch (e) {
                              debugPrint('Erro ao entrar na conversa após gerar link: $e');
                            }
                            saveChatLinks();
                            if (!mounted) return;
                            showDialog(
                              context: navigator.context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title: Row(
                                    children: [
                                      CircleAvatar(
                                        backgroundColor: Colors.green[600],
                                        child: Icon(Icons.chat, color: Colors.white),
                                      ),
                                      SizedBox(width: 8),
                                      Text('Link Gerado'),
                                    ],
                                  ),
                                  content: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Envie este link ao cliente:'),
                                      SizedBox(height: 8),
                                      SelectableText(
                                        newLink,
                                        style: TextStyle(fontSize: 16, color: Colors.blue[900]),
                                      ),
                                    ],
                                  ),
                                  actions: [
                                    TextButton(
                                      child: Text('Fechar'),
                                      onPressed: () => navigator.pop(),
                                    ),
                                  ],
                                );
                              },
                            );
                          } catch (e) {
                            setState(() {
                              generatedChatLinks.add('Erro ao gerar link.');
                            });
                            saveChatLinks();
                            if (!mounted) return;
                            showDialog(
                              context: navigator.context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title: Text('Erro'),
                                  content: Text('Erro ao gerar link.'),
                                  actions: [
                                    TextButton(
                                      child: Text('Fechar'),
                                      onPressed: () => navigator.pop(),
                                    ),
                                  ],
                                );
                              },
                            );
                          }
                          setState(() { isGeneratingLink = false; });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green[100],
                          foregroundColor: Colors.green[900],
                          padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 16),
                Expanded(
                  child: ListView.builder(
                    itemCount: generatedChatLinks.length,
                    itemBuilder: (context, index) {
                      final link = generatedChatLinks[index];
                      final localLinkId = link.split('/').last;
                      final name = customerNames[localLinkId] ?? '';
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Card(
                          color: Colors.green[50],
                          elevation: 2,
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Colors.green[600],
                              child: Icon(Icons.chat, color: Colors.white),
                            ),
                            title: Row(
                              children: [
                                Expanded(child: Text('Cliente: $name')),
                                IconButton(
                                  icon: Icon(Icons.edit, color: Colors.blue[800]),
                                  onPressed: () async {
                                    final controller = TextEditingController(text: name);
                                    final result = await showDialog<String>(
                                      context: context,
                                      builder: (context) {
                                        return AlertDialog(
                                          title: Text('Editar nome do cliente'),
                                          content: TextField(
                                            controller: controller,
                                            decoration: InputDecoration(labelText: 'Novo nome'),
                                          ),
                                          actions: [
                                            TextButton(
                                              onPressed: () => Navigator.of(context).pop(),
                                              style: TextButton.styleFrom(foregroundColor: Colors.green[700]),
                                              child: Text('Cancelar'),
                                            ),
                                            TextButton(
                                              onPressed: () => Navigator.of(context).pop(controller.text.trim()),
                                              style: TextButton.styleFrom(foregroundColor: Colors.green[700]),
                                              child: Text('Salvar'),
                                            ),
                                          ],
                                        );
                                      },
                                    );
                                    if (result != null && result.isNotEmpty) {
                                      setState(() {
                                        customerNames[localLinkId] = result;
                                      });
                                      saveChatLinks();
                                      
                                      await http.patch(
                                        Uri.parse('/chat/conversations/$localLinkId'),
                                        headers: {'Content-Type': 'application/json'},
                                        body: jsonEncode({'customerName': result}),
                                      );
                                    }
                                  },
                                ),
                              ],
                            ),
                            subtitle: SelectableText(link),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: Icon(Icons.copy, color: Colors.green[800]),
                                  onPressed: () {
                                    Clipboard.setData(ClipboardData(text: link));
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('Link copiado!')),
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: Icon(Icons.delete, color: Colors.red[400]),
                                  onPressed: () async {
                                    final confirm = await showDialog<bool>(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        title: Text('Excluir Conversa'),
                                        content: Text('Tem certeza que deseja excluir esta conversa?'),
                                        actions: [
                                          TextButton(
                                            onPressed: () => Navigator.of(context).pop(false),
                                            style: TextButton.styleFrom(foregroundColor: Colors.green[700]),
                                            child: Text('Cancelar'),
                                          ),
                                          TextButton(
                                            onPressed: () => Navigator.of(context).pop(true),
                                            style: TextButton.styleFrom(foregroundColor: Colors.red),
                                            child: Text('Excluir'),
                                          ),
                                        ],
                                      ),
                                    );

                                    if (confirm == true) {
                                      setState(() {
                                        generatedChatLinks.removeAt(index);
                                        customerNames.remove(localLinkId);
                                        customerIds.remove(localLinkId);
                                      });
                                      await saveChatLinks();

                                      try {
                                        if (linkId == localLinkId) {
                                          socket.emit('leave_conversation', localLinkId);
                                          setState(() {
                                            linkId = null;
                                            messages.clear();
                                          });
                                        }
                                      } catch (e) {
                                        debugPrint('Erro ao sair da conversa: $e');
                                      }
                                    }
                                  },
                                ),
                              ],
                            ),
                            onTap: () {
                              String conversationId = localLinkId;
                              GoRouter.of(context).push('/chat/$conversationId');
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(8.0),
                  color: Colors.green[800],
                  width: double.infinity,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Chat',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: isSocketConnecting 
                                ? Colors.orangeAccent 
                                : (isSocketConnected ? Colors.greenAccent : Colors.redAccent),
                              shape: BoxShape.circle,
                            ),
                          ),
                          SizedBox(width: 8),
                          GestureDetector(
                            onTap: () {
                              // Atualiza o estado com o estado real do socket
                              if (mounted) {
                                setState(() {
                                  isSocketConnected = socket.connected;
                                  isSocketConnecting = false;
                                });
                                debugPrint('🔍 Estado do socket: ${socket.connected}');
                              }
                            },
                            child: Text(
                              isSocketConnecting 
                                ? 'Conectando...' 
                                : (isSocketConnected ? 'Conectado' : 'Desconectado'),
                              style: TextStyle(color: Colors.white, fontSize: 14),
                            ),
                          ),
                          SizedBox(width: 8),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Stack(
                    children: [
                      GroupedListView<Message, DateTime>(
                        padding: const EdgeInsets.all(8),
                        reverse: true,
                        order: GroupedListOrder.DESC,
                        useStickyGroupSeparators: true,
                        floatingHeader: true,
                        elements: messages,
                        groupBy: (message) => DateTime(
                          message.date.year,
                          message.date.month,
                          message.date.day,
                        ),
                        groupHeaderBuilder: (Message message) => SizedBox(
                          height: 50,
                          child: Center(
                            child: Card(
                              color: Colors.blue[100],
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Text(
                                  // show day-first date format (DD/MM/YYYY)
                                  DateFormat('dd/MM/yyyy').format(message.date),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue[800],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        itemBuilder: (context, Message message) => Align(
                          alignment: message.isSentByMe
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: Card(
                            color: message.isSentByMe ? Colors.green[100] : Colors.grey[200],
                            elevation: 8,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Text(
                                message.text,
                                style: TextStyle(
                                  color: message.isSentByMe ? Colors.green[900] : Colors.black87,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      if (isSomeoneTyping)
                        Positioned(
                          left: 16,
                          bottom: 16,
                          child: Container(
                            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
                            ),
                            child: Text('$typingUser está digitando...', style: TextStyle(color: Colors.green[800])),
                          ),
                        ),
                    ],
                  ),
                ),
                if (widget.conversationId != null && widget.conversationId!.isNotEmpty)
                  Column(
                    children: [
                      Container(
                        color: Colors.grey[100],
                        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          children: [
                            Text('ChatGPT ativo', style: TextStyle(fontWeight: FontWeight.bold)),
                            Switch(
                              value: chatGptActive,
                              onChanged: (value) => toggleChatGpt(value),
                              activeThumbImage: null,
                              activeThumbColor: Colors.green,
                            ),
                          ],
                        ),
                      ),
                      Container(
                        color: Colors.grey[200],
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _controller,
                                enabled: !chatGptActive,
                                decoration: InputDecoration(
                                  labelText: chatGptActive ? 'AI mode ativo, digitação desabilitada' : 'Digite sua mensagem aqui',
                                  labelStyle: TextStyle(color: Colors.black54),
                                  floatingLabelStyle: TextStyle(color: Colors.black54),
                                  border: OutlineInputBorder(
                                    borderSide: BorderSide(color: Colors.grey),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(color: Colors.grey),
                                  ),
                                  filled: true,
                                  fillColor: Colors.white,
                                ),
                                onChanged: chatGptActive ? null : (text) {
                                  if (linkId != null && text.isNotEmpty) {
                                    socket.emit('typing', {
                                      'conversationId': linkId,
                                      'sender': 'Staff',
                                    });
                                  }
                                },
                                onSubmitted: chatGptActive ? null : (text) {
                                  if (text.trim().isEmpty) return;
                                  _controller.clear();
                                  final token = accessTokens[linkId];
                                  socket.emit('send_message', {
                                    'conversationId': linkId,
                                    'sender': 'staff',
                                    'text': text,
                                    'token': token,
                                  });
                                },
                              ),
                            ),
                            AnimatedSwitcher(duration: const Duration(seconds: 1),
                              child: IconButton(
                                icon: Icon(Icons.send, color: Colors.green[800],size: 30),
                                onPressed: chatGptActive ? null : () {
                                  final text = _controller.text;
                                  if (text.trim().isEmpty) return;
                                  _controller.clear();
                                  final token = accessTokens[linkId];
                                  socket.emit('send_message', {
                                    'conversationId': linkId,
                                    'sender': 'staff',
                                    'text': text,
                                    'token': token,
                                  });
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}