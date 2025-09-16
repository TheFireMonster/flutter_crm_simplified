import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_crm/services/auth_service.dart';
import 'package:flutter_crm/widgets/login/login_desktop.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String _email = '';
  String _password = '';
  bool _loading = false;
  String _error = '';

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final user = await authService.signIn(
        email: _email,
        password: _password,
      );

      if (user == null) {
        setState(() {
          _error = 'Usuário não encontrado.';
          _loading = false;
        });
        return;
      }

      if (!mounted) return;
      context.go('/home');
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Center(
        child: SizedBox(
          width: 400,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_loading) const CircularProgressIndicator(),
              if (_error.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    _error,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
              LoginDesktop(
                email: _email,
                password: _password,
                onEmailChanged: (value) => setState(() => _email = value),
                onPasswordChanged: (value) => setState(() => _password = value),
                onLoginPressed: _login,
                onSignUpTapped: () => context.go('/register'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}