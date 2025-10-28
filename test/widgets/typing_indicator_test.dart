import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class TypingIndicator extends StatelessWidget {
  final String user;
  const TypingIndicator(this.user, {super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text('$user está digitando...', style: TextStyle(color: Colors.green[800])),
    );
  }
}

void main() {
  testWidgets('typing indicator displays the user name and green color', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(body: TypingIndicator('Joao')),
    ));

    expect(find.text('Joao está digitando...'), findsOneWidget);
    final text = tester.widget<Text>(find.text('Joao está digitando...'));
    expect(text.style?.color, equals(Colors.green[800]));
  });
}
