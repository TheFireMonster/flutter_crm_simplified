
import 'package:flutter/material.dart';
import 'package:grouped_list/grouped_list.dart';
import 'package:flutter_crm/widgets/chat/messages.dart';
import 'package:intl/intl.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:http/http.dart' as http;
import 'dart:convert';


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
    try {
      final response = await http.get(
        Uri.parse('/chat/history/$conversationId'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          messages = data.map((msg) => Message(
            text: msg['content'],
            date: DateTime.parse(msg['createdAt']),
            isSentByMe: (msg['sender'] == 'staff'),
          )).toList();
        });
      } else {
      }
    } catch (e) {
    }
  }
  final TextEditingController _controller = TextEditingController();
  bool isDrawerOpen = false;
  String? generatedCustomerId;
  List<String> generatedChatLinks = [];
  Map<String, String> customerNames = {};
  // keep dynamic to handle existing string ids and numeric ids during migration
  Map<String, dynamic> customerIds = {};
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
        customerIds = Map<String, int>.from(jsonDecode(idsJson));
      }
    });
  }

  Future<void> saveChatLinks() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('chatLinks', generatedChatLinks);
    await prefs.setString('customerNames', jsonEncode(customerNames));
    await prefs.setString('customerIds', jsonEncode(customerIds));
  }
  bool isGeneratingLink = false;
  final TextEditingController _customerNameController = TextEditingController();
  late io.Socket socket;
  List<Message> messages = [];
  final Set<int> _receivedMessageIds = {};
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
  
  if (widget.conversationId != null && widget.conversationId!.isNotEmpty) {
    linkId = widget.conversationId;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _joinConversationIfNeeded();
    });
  }
  }

  void _joinConversationIfNeeded() {
    if (linkId == null) return;
    try {
      try { socket.emit('join_conversation', linkId); } catch (_) {}
    } catch (_) {}
    loadMessageHistory(linkId!);
    fetchChatGptStatus();
  }

  void connectToServer() {
    // Determine server URL: prefer current origin (useful on web / deployed apps).
  final origin = Uri.base.origin;
  final serverUrl = (origin.isNotEmpty && origin.startsWith('http')) ? origin : 'http://localhost:3000';

    socket = io.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    socket.onConnect((_){
      if (kDebugMode) print('Socket connected to $serverUrl');
      if (linkId != null) {
        try { socket.emit('join_conversation', linkId); } catch (_) {}
      }
    });

    socket.onConnectError((err){
      if (kDebugMode) print('Socket connect error: $err');
    });

    socket.onError((err){
      if (kDebugMode) print('Socket error: $err');
    });

    socket.onDisconnect((_){
      if (kDebugMode) print('Socket disconnected');
    });

    socket.on('receive_message', (data) {
      final incomingId = int.parse(data['id']?.toString() ?? '0');
      if (_receivedMessageIds.contains(incomingId)) {
        return;
      }
      final message = Message(
        text: data['content'] ?? data['text'],
        date: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
        isSentByMe: (data['sender'] == 'staff'),
      );
  _receivedMessageIds.add(incomingId);
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
      if (sender != 'staff') {
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

        String generateCustomerId(String name) {
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        return '${name}_$timestamp';
      }

      Future<Map<String, dynamic>> fetchConversationInfo(String? customerId, String customerName) async {
        final body = customerId != null ? {'customerId': customerId, 'customerName': customerName} : {'customerName': customerName};
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
                            final newLink = info['url'];
                            setState(() {
                              generatedChatLinks.add(newLink);
                              customerNames[linkId!] = name;
                              // preserve the original type returned by the server (number when possible)
                              if (info.containsKey('customerId') && info['customerId'] != null) {
                                customerIds[linkId!] = info['customerId'];
                              }
                            });
                              try { socket.emit('join_conversation', linkId); } catch (_) {}
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
                                      Text('WhatsApp'),
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
                                              child: Text('Cancelar'),
                                              onPressed: () => Navigator.of(context).pop(),
                                            ),
                                            TextButton(
                                              child: Text('Salvar'),
                                              onPressed: () => Navigator.of(context).pop(controller.text.trim()),
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
                                      setState(() {
                                        generatedChatLinks.removeAt(index);
                                        customerNames.remove(localLinkId);
                                        customerIds.remove(localLinkId);
                                      });
                                      await saveChatLinks();

                                      // if the deleted conversation is currently open on the right,
                                      // clear it and leave the conversation on the socket
                                      try {
                                        if (linkId == localLinkId) {
                                          try { socket.emit('leave_conversation', localLinkId); } catch (_) {}
                                          setState(() {
                                            linkId = null;
                                            messages.clear();
                                          });
                                        }
                                      } catch (_) {}
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
                  child: Text(
                    'Chat',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
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
                                      'sender': 'staff',
                                    });
                                  }
                                },
                                onSubmitted: chatGptActive ? null : (text) {
                                  if (text.trim().isEmpty) return;
                                  _controller.clear();
                                  socket.emit('send_message', {
                                    'conversationId': linkId,
                                    'sender': 'staff',
                                    'text': text,
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
                                  socket.emit('send_message', {
                                    'conversationId': linkId,
                                    'sender': 'staff',
                                    'text': text,
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