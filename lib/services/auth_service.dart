import 'package:firebase_auth/firebase_auth.dart';

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
    }
    return cred.user;
  }

  Future<User?> signIn({
    required String email,
    required String password,
  }) async {
    final cred = await firebaseAuth.signInWithEmailAndPassword(
      email: email,
      password: password,
      
    );
    return cred.user;
  }

  String getFirebaseAuthErrorMessage(String code) {
    switch (code) {
      case 'invalid-email':
        return 'O e-mail informado é inválido.';
      case 'user-not-found':
        return 'Usuário não encontrado.';
      case 'wrong-password':
        return 'Senha incorreta.';
      case 'email-already-in-use':
        return 'Este e-mail já está em uso.';
      case 'weak-password':
        return 'A senha é muito fraca.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  }
}
