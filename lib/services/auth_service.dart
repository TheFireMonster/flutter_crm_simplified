import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'token_manager.dart';

final authService = AuthService();

class AuthService {
  final firebaseAuth = FirebaseAuth.instance;

  Future<User?> createAccount({
    required String name,
    required String email,
    required String password,
  }) async {
    final cred = await firebaseAuth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    if (cred.user != null) {
      await cred.user!.updateDisplayName(name);
      await _registerBackend(cred.user!);
    }
    return cred.user;
  }

  Future<void> _registerBackend(User user) async {
    final idToken = await user.getIdToken();
    final resp = await http.post(
      Uri.parse('http://localhost:3000/auth/firebase-register'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode({'name': user.displayName}),
    );
    if (resp.statusCode == 200) {
      final data = jsonDecode(resp.body);
      await TokenManager.saveToken(
        data['token'],
        data['expiry'],
        refreshToken: data['refresh_token'],
        roles: data['roles'] != null ? List<String>.from(data['roles']) : [],
      );
    }
  }

  Future<User?> signIn({
    required String email,
    required String password,
  }) async {
    final cred = await firebaseAuth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    if (cred.user != null) {
      await _loginBackend(cred.user!);
    }
    return cred.user;
  }

  Future<void> _loginBackend(User user) async {
    final idToken = await user.getIdToken();
    final resp = await http.post(
      Uri.parse('http://localhost:3000/auth/firebase-login'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
    );
    if (resp.statusCode == 200) {
      final data = jsonDecode(resp.body);
      await TokenManager.saveToken(
        data['token'],
        data['expiry'],
        refreshToken: data['refresh_token'],
        roles: data['roles'] != null ? List<String>.from(data['roles']) : [],
      );
    }
  }
}