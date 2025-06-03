import 'package:flutter/material.dart';
import 'package:flutter_crm/views/pages/login_page.dart';

void main() {
  runApp(const MyApp());
}

String title = 'Flutter';



class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: LoginPage()
    );
  }
}