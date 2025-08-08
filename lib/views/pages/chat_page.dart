import 'package:flutter/material.dart';
import 'package:grouped_list/grouped_list.dart';
import 'package:flutter_crm/widgets/chat/messages.dart';
import 'package:intl/intl.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat')),
      body: Column(
        children: [
          Expanded(child: GroupedListView<Message, DateTime>(
            padding: const EdgeInsets.all(8),
            elements: messages,
            groupBy: (message) => DateTime(
              message.date.year, 
              message.date.month, 
              message.date.day),
            groupHeaderBuilder: (Message message) => SizedBox(
              height: 40,
              child: Center(
                child: Card(
                  color: Colors.blue[100],
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      DateFormat.yMMMd().format(message.date),
                      style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue[800]),
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
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(message.text)
                ),
              ),
            ),
          ) ,
          ),
          Container(
            color: Colors.grey[200],
            child: TextField(
              decoration: InputDecoration(
                labelText: 'Type your message here',
                labelStyle: TextStyle(color: Colors.black54),
                floatingLabelStyle: TextStyle(color: Colors.black54),
                border: OutlineInputBorder(borderSide: BorderSide(color: Colors.grey)),
                focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.grey)),
                filled: true,
                fillColor: Colors.white,
              ),
              onSubmitted: (String message) {
                // Handle the message submission
                print('Message sent: $message');
              },
            ),
          ),
        ],
      ),
    );
  }
}
