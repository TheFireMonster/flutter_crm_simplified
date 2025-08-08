class Message {
  final String text;
  final DateTime date;
  final bool isSentByMe;

  Message({
    required this.text,
    required this.date,
    required this.isSentByMe,
  });
}

List<Message> messages = [
  Message(
    text: "Hello!",
    date: DateTime.now().subtract(const Duration(minutes: 5)),
    isSentByMe: false,
  ),
];