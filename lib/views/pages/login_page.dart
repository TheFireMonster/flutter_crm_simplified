import 'package:flutter/material.dart';
import 'package:flutter_crm/views/pages/home_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

String _email = '';
String _password = '';

class _LoginPageState extends State<LoginPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Flutter'), centerTitle: true),
      body: Center(
        child: Column(
          children: [
            Text('Login Page'),
            SizedBox(
              width: 250,
              child: TextField(
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(label: Text("Email")),
                onChanged: (value) {
                  setState(() {
                    _email = value;
                  });
                },
              ),
            ),
            const SizedBox(height: 20),
            Text("Your email: $_email"),
            SizedBox(
              width: 250,
              child: TextField(
                obscureText: true,
                decoration: const InputDecoration(label: Text("Senha")),
                onChanged: (value) {
                  setState(() {
                    _password = value;
                  });
                },
              ),
            ),
            ElevatedButton(onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) => HomePage()));
            }, 
            child: const Text("Login")),
          ],
        ),
      ),
    );
  }
}
