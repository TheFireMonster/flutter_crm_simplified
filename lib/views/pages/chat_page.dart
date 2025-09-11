import 'package:flutter/material.dart';
import 'package:grouped_list/grouped_list.dart';
import 'package:flutter_crm/widgets/chat/messages.dart';
import 'package:intl/intl.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
    final TextEditingController _controller = TextEditingController();
    bool isDrawerOpen = false;

    void toggleDrawer() {
      setState(() {
        isDrawerOpen = !isDrawerOpen;
      });
    }

    late IO.Socket socket;

@override
void initState() {
  super.initState();
  connectToServer();
}

void connectToServer() {
  socket = IO.io('http://localhost:3000', <String, dynamic>{
    'transports': ['websocket'],
    'autoConnect': true,
  });

  socket.onConnect((_) {
    print('✅ Connected to server');
  });

  socket.onDisconnect((_) {
    print('❌ Disconnected from server');
  });

  // Recebe mensagens vindas do backend
  socket.on('receive_message', (data) {
    final message = Message(
      text: data['text'],
      date: DateTime.now(),
      isSentByMe: false,
    );
    setState(() => messages.add(message));
  });
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
                    'Chat Messages',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
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
                  child: GroupedListView<Message, DateTime>(
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
                ),
                Container(
                  color: Colors.grey[200],
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller, // ✅ Attach controller
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
                          onSubmitted: (text) {
                            if (text.trim().isEmpty) return; // Avoid sending empty messages
                                    
                            final message = Message(
                              text: text,
                              date: DateTime.now(),
                              isSentByMe: true,
                            );
                                    
                            setState(() => messages.add(message));
                            _controller.clear(); // ✅ Clear text field

                             socket.emit('send_message', {'text': text});
                            print('Message sent: $message');
                          },
                        ),
                      ),
                      AnimatedSwitcher(duration: const Duration(seconds: 1),
                        child: IconButton(
                          icon: Icon(Icons.send, color: Colors.green[800],size: 30),
                          onPressed: () {
                            final text = _controller.text;
                            if (text.trim().isEmpty) return; // Avoid sending empty messages
                                    
                            final message = Message(
                              text: text,
                              date: DateTime.now(),
                              isSentByMe: true,
                            );
                                    
                            setState(() => messages.add(message));
                            _controller.clear(); // ✅ Clear text field
                            print('Message sent: $message');
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}