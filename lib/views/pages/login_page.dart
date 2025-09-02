import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_crm/views/pages/home_page.dart';
import 'package:flutter_crm/widgets/login/login_desktop.dart';
import 'package:flutter_crm/widgets/login/login_mobile.dart';
import 'package:flutter_crm/views/pages/register_page.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

String _email = '';
String _password = '';

class _LoginPageState extends State<LoginPage> {
  bool _loading = false;
  String _error = '';

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    final response = await http.post(
      Uri.parse('http://localhost:3000/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': _email, 'password': _password}),
    );

    setState(() {
      _loading = false;
    });

    if (response.statusCode == 200) {
      // Login successful, navigate to HomePage
      final data = jsonDecode(response.body);
      final token = data['token'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => HomePage()),
      );
    } else {
      if (!mounted) return;
      // Login failed, show error message
      setState(() {
        _error = 'E-mail ou senha inválidos.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isMobile =
        defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
    //bool isDesktop = defaultTargetPlatform == TargetPlatform.windows || defaultTargetPlatform == TargetPlatform.macOS || defaultTargetPlatform == TargetPlatform.linux;

    return Scaffold(
      appBar: AppBar(title: Text('Login Page'), centerTitle: true),
      body: Center(
        child:
            Column(
              children: [
                if (_loading) CircularProgressIndicator(),
                if (_error.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      _error,
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                Expanded(
                  child: 
                    isMobile
                        ? LoginMobile(
                          email: _email,
                          password: _password,
                          onEmailChanged: (value) {
                            setState(() => _email = value);
                          },
                          onPasswordChanged: (value) {
                            setState(() => _password = value);
                          },
                          onLoginPressed:
                              () => Navigator.pushReplacement(
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
                          onLoginPressed:
                              () => Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(builder: (context) => HomePage()),
                              ),
                          onSignUpTapped:
                              () => Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(builder: (context) => RegisterPage()),
                              ),
                        ),
                ),
              ],
            ),
      ),
    );
  }
}
