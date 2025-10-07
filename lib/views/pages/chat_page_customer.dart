import 'package:flutter/material.dart';
import 'package:grouped_list/grouped_list.dart';
import 'package:flutter_crm/widgets/chat/messages.dart';
import 'package:intl/intl.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:http/http.dart' as http;
import 'dart:convert';

class ChatPageCustomer extends StatefulWidget {
  final String conversationId;
  const ChatPageCustomer({super.key, required this.conversationId});

  @override
  State<ChatPageCustomer> createState() => _ChatPageCustomerState();
}

class _ChatPageCustomerState extends State<ChatPageCustomer> {
  final TextEditingController _controller = TextEditingController();
  late IO.Socket socket;
  List<Message> messages = [];
  bool isSomeoneTyping = false;
  String typingUser = '';

  @override
  void initState() {
    super.initState();
    connectToServer();
    loadHistory();
  }

  void connectToServer() {
    socket = IO.io('http://localhost:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    socket.onConnect((_) {
      print('✅ Connected to chat server');
      socket.emit('join_conversation', widget.conversationId);
    });

    socket.onDisconnect((_) {
      print('❌ Disconnected from chat server');
    });

    socket.on('receive_message', (data) {
      final message = Message(
        text: data['content'] ?? data['text'],
        date: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
        isSentByMe: data['sender'] == 'client',
      );
      setState(() => messages.add(message));
    });

    socket.on('typing', (data) {
      setState(() {
        isSomeoneTyping = true;
        typingUser = data['sender'] ?? '';
      });
      Future.delayed(Duration(seconds: 2), () {
        setState(() {
          isSomeoneTyping = false;
        });
      });
    });
  }

  Future<void> loadHistory() async {
    final url = 'http://localhost:3000/chat/history/${widget.conversationId}';
    final resp = await http.get(Uri.parse(url));
    if (resp.statusCode == 200) {
      final List<dynamic> data = jsonDecode(resp.body);
      setState(() {
        messages = data.map((msg) => Message(
          text: msg['content'],
          date: DateTime.parse(msg['createdAt']),
          isSentByMe: msg['sender'] == 'client',
        )).toList();
      });
    }
  }

  void sendMessage(String text) {
    if (text.trim().isEmpty) return;
    final message = Message(
      text: text,
      date: DateTime.now(),
      isSentByMe: true,
    );
    setState(() => messages.add(message));
    _controller.clear();
    socket.emit('send_message', {
      'conversationId': widget.conversationId,
      'sender': 'client',
      'text': text,
    });
    print('Message sent: $message');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat')),
      body: Column(
        children: [
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
                            DateFormat.yMMMd().format(message.date),
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
                      elevation: 8,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(message.text),
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
          Container(
            color: Colors.grey[200],
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                labelText: 'Type your message here',
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
              onChanged: (text) {
                if (widget.conversationId.isNotEmpty && text.isNotEmpty) {
                  socket.emit('typing', {
                    'conversationId': widget.conversationId,
                    'sender': 'client',
                  });
                }
              },
              onSubmitted: (text) {
                if (text.trim().isEmpty) return;
                _controller.clear();
                socket.emit('send_message', {
                  'conversationId': widget.conversationId,
                  'sender': 'client',
                  'text': text,
                });
                print('Message sent: $text');
              },
            ),
          ),
        ],
      ),
    );
  }
}