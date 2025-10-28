import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_crm/services/auth_service.dart';
import 'package:flutter_crm/widgets/login/login_desktop.dart';
import 'package:firebase_auth/firebase_auth.dart';

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
  debugPrint('Login button pressed');
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
  debugPrint('Calling authService.signIn with email: $_email');
      final user = await authService.signIn(
        email: _email,
        password: _password,
      );
  debugPrint('authService.signIn returned: $user');

      if (user == null) {
  debugPrint('No user found, showing error');
        setState(() {
          _error = 'Usuário não encontrado.';
          _loading = false;
        });
        return;
      }

      if (!mounted) {
  debugPrint('Widget not mounted, aborting navigation');
        return;
      }
  debugPrint('Navigating to /home');
      context.go('/home');
    } catch (e) {
  debugPrint('Error during login: $e');
      if (e is FirebaseAuthException) {
        setState(() {
          _error = authService.getFirebaseAuthErrorMessage(e.code);
        });
      } else {
        setState(() {
          _error = 'Ocorreu um erro inesperado.';
        });
      }
    } finally {
      setState(() {
        _loading = false;
      });
  debugPrint('Login flow finished');
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