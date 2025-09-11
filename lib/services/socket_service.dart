import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:firebase_auth/firebase_auth.dart';

class SocketService {
  late io.Socket socket;

  Future<void> connect() async {
    final user = FirebaseAuth.instance.currentUser;
    final token = await user!.getIdToken();

    socket = io.io(
      'http://10.0.2.2:3000', // se usar emulador Android, localhost -> 10.0.2.2
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .build(),
    );

    socket.onConnect((_) => print('Conectado!'));
    socket.on('receive_message', (data) {
      print('Nova mensagem: $data');
    });
  }

  void sendMessage(String text) {
    socket.emit('send_message', {'text': text});
  }
}