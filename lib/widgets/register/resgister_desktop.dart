import 'package:flutter/material.dart';

class RegisterDesktop extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final VoidCallback onRegisterPressed;
  final VoidCallback onLoginTapped;
  final bool loading;
  final String error;

  const RegisterDesktop({
    super.key,
    required this.formKey,
    required this.nameController,
    required this.emailController,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.onRegisterPressed,
    required this.onLoginTapped,
    this.loading = false,
    this.error = '',
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(20),
        height: 600,
        width: 700,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withValues(alpha: 0.5),
              spreadRadius: 5,
              blurRadius: 7,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (loading) const CircularProgressIndicator(),
                if (error.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      error,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                _buildTextFormField(
                  label: 'Nome',
                  controller: nameController,
                  keyboardType: TextInputType.name,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Por favor, insira seu nome';
                    }
                    return null;
                  },
                ),
                _buildTextFormField(
                  label: 'Email',
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Por favor, insira seu email';
                    }
                    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
                    if (!emailRegex.hasMatch(value.trim())) {
                      return 'Por favor, insira um email válido';
                    }
                    return null;
                  },
                ),
                _buildTextFormField(
                  label: 'Senha',
                  controller: passwordController,
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.length < 8) {
                      return 'A senha deve ter pelo menos 8 caracteres';
                    }
                    return null;
                  },
                ),
                _buildTextFormField(
                  label: 'Confirme a Senha',
                  controller: confirmPasswordController,
                  obscureText: true,
                  validator: (value) {
                    if (value != passwordController.text) {
                      return 'As senhas não coincidem';
                    }
                    return null;
                  },
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 25),
                  child: SizedBox(
                    width: 400,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: loading
                          ? null
                          : () {
                              if (formKey.currentState?.validate() ?? false) {
                                onRegisterPressed();
                              }
                            },
                      child: loading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              "Registrar",
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: loading ? null : onLoginTapped,
                  child: Text(
                    "Já tem conta? Faça login",
                    style: TextStyle(
                      fontWeight: FontWeight.w400,
                      fontSize: 16,
                      color: Colors.blueGrey[700],
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextFormField({
    required String label,
    required TextEditingController controller,
    bool obscureText = false,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.all(25.0),
      child: SizedBox(
        width: 400,
        height: 48,
        child: TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          decoration: InputDecoration(
            labelText: label,
            labelStyle: const TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 18,
              color: Colors.blueGrey,
            ),
            border: const OutlineInputBorder(),
          ),
          style: const TextStyle(
            fontSize: 20,
            color: Colors.black87,
          ),
        ),
      ),
    );
  }
}