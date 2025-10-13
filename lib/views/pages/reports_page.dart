import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:fl_chart/fl_chart.dart';

class ReportsPage extends StatefulWidget {
  const ReportsPage({super.key});

  @override
  State<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends State<ReportsPage> {
  final TextEditingController _controller = TextEditingController();
  String get chartPrompt => _controller.text;
  bool isDrawerOpen = false;

 void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Reports Page')),
      body: Row(
        children: [
          SideMenu(isDrawerOpen: isDrawerOpen, toggleDrawer: toggleDrawer),
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
        