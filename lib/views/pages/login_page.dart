import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_crm/views/pages/home_page.dart';
import 'package:flutter_crm/widgets/login/login_desktop.dart';
import 'package:flutter_crm/widgets/login/login_mobile.dart';

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
    bool isMobile = defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS;
    bool isDesktop = defaultTargetPlatform == TargetPlatform.windows || defaultTargetPlatform == TargetPlatform.macOS || defaultTargetPlatform == TargetPlatform.linux;

    return Scaffold(
      appBar: AppBar(title: Text('Login Page'), centerTitle: true),
      body: Center(
        child: isMobile
            ? LoginMobile(
                email: _email,
                password: _password,
                onEmailChanged: (value) {
                  setState(() => _email = value);
                },
                onPasswordChanged: (value) {
                  setState(() => _password = value);
                },
                onLoginPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => HomePage()),
                ),
              )
            : LoginDesktop(
                email: _email,
                password: _password,
                onEmailChanged: (value) {
                  setState(() => _email = value);
                },
                onPasswordChanged: (value) {
                  setState(() => _password = value);
                },
                onLoginPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => HomePage()),
                ),
              ),
      ),
    );
  }
}
