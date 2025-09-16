import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
// TokenManager import removed for pure Firebase login

final authService = AuthService(); // No TokenManager

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
      // No backend token registration, only Firebase
    }
    return cred.user;
  }

  // _registerBackend removed for pure Firebase login

  Future<User?> signIn({
    required String email,
    required String password,
  }) async {
    final cred = await firebaseAuth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    // Only Firebase login, no backend token
    return cred.user;
  }

  // _loginBackend removed for pure Firebase login
}