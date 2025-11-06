import 'package:flutter/material.dart';

class LoginDesktop extends StatelessWidget {
  final String email;
  final String password;
  final ValueChanged<String> onEmailChanged;
  final ValueChanged<String> onPasswordChanged;
  final VoidCallback onLoginPressed;
  final VoidCallback onSignUpTapped;

  const LoginDesktop(
    {
      super.key,
      required this.email,
      required this.password,
      required this.onEmailChanged,
      required this.onPasswordChanged,
      required this.onLoginPressed,
      required this.onSignUpTapped,
    }
  );

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(20.0),
        height: 500,
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
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Padding(
                padding: const EdgeInsets.all(25.0),
                child: SizedBox(
                  width: 400,
                  height: 48,
                  child: TextField(
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: "Email",
                      labelStyle: TextStyle(
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.w500,
                        fontSize: 18,
                        color: Colors.blueGrey,
                      ),
                      border: OutlineInputBorder(),
                    ),
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 20,
                      color: Colors.black87,
                    ),
                    onChanged: onEmailChanged,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(25.0),
                child: SizedBox(
                  width: 400,
                  height: 48,
                  child: TextField(
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: "Senha",
                      labelStyle: TextStyle(
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.w500,
                        fontSize: 18,
                        color: Colors.blueGrey,
                      ),
                      border: OutlineInputBorder(),
                    ),
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 20,
                      color: Colors.black87,
                    ),
                    onChanged: onPasswordChanged,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 25),
                child: SizedBox(
                  width: 400,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: onLoginPressed,
                    style: ElevatedButton.styleFrom( 
                      backgroundColor: Colors.green[300],
                    ),
                    child: Text(
                      "Login",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              GestureDetector(
                onTap: onSignUpTapped,
                child: Text(
                  "Cadastrar-se",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'Roboto',
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
    );
  }
}
