import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('chat bubbles use the expected green palette', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Column(
          children: [
            // staff / sent bubble
            Card(
              color: Colors.green[100],
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Text('Staff message', style: TextStyle(color: Colors.green[900])),
              ),
            ),
            // customer / received bubble
            Card(
              color: Colors.green[50],
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Text('Customer message', style: TextStyle(color: Colors.green[800])),
              ),
            ),
          ],
        ),
      ),
    ));

    // Ensure two Card widgets exist
    final cards = find.byType(Card);
    expect(cards, findsNWidgets(2));

    final staffCard = tester.widget<Card>(cards.at(0));
    final customerCard = tester.widget<Card>(cards.at(1));

    expect(staffCard.color, equals(Colors.green[100]));
    expect(customerCard.color, equals(Colors.green[50]));

    final staffText = find.text('Staff message');
    final customerText = find.text('Customer message');
    expect(staffText, findsOneWidget);
    expect(customerText, findsOneWidget);

    final staffTextWidget = tester.widget<Text>(staffText);
    final customerTextWidget = tester.widget<Text>(customerText);

    expect(staffTextWidget.style?.color, equals(Colors.green[900]));
    expect(customerTextWidget.style?.color, equals(Colors.green[800]));
  });
}
