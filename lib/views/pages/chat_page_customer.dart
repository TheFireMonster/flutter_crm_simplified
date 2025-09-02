import 'package:flutter/material.dart';
import 'package:grouped_list/grouped_list.dart';
import 'package:flutter_crm/widgets/chat/messages.dart';
import 'package:intl/intl.dart';

class ChatPageCustomer extends StatefulWidget {
  const ChatPageCustomer({super.key});

  @override
  State<ChatPageCustomer> createState() => _ChatPageCustomerState();
}

class _ChatPageCustomerState extends State<ChatPageCustomer> {
    final TextEditingController _controller = TextEditingController(); // ✅ Controller

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat')),
      body: Column(
        children: [
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
                print('Message sent: $message');
              },
            ),
          ),
        ],
      ),
    );
  }
}