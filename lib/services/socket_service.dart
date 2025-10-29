import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode;
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:firebase_auth/firebase_auth.dart';


class SocketService {
  static const String deployedServerUrl = 'https://flutter-crm-simplified.onrender.com';

  io.Socket? socket;

  Future<void> connect() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      if (kDebugMode) print('SocketService.connect aborted: no authenticated user');
      return;
    }

    final token = await user.getIdToken();
    final List<String> candidates = [];
    if (kIsWeb) {
      final origin = Uri.base.origin;
      if (origin.isNotEmpty && origin.startsWith('http')) candidates.add(origin);
      candidates.add(deployedServerUrl);
    } else {
      candidates.add('http://10.0.2.2:3000');
      candidates.add(deployedServerUrl);
    }

    int attempt = 0;

    void attemptConnect(int idx) {
      if (idx >= candidates.length) {
        if (kDebugMode) print('SocketService.connect: all connection attempts failed');
        return;
      }

      final url = candidates[idx];
      if (url.isEmpty || url == 'null' || !(url.startsWith('http') || url.startsWith('ws'))) {
        if (kDebugMode) print('SocketService.connect skipping invalid url: $url');
        attemptConnect(idx + 1);
        return;
      }

      try {
        socket?.disconnect();
        socket?.dispose();
      } catch (_) {}

      final s = socket = io.io(
        url,
        <String, dynamic>{
          'transports': ['websocket'],
          'auth': {'token': token},
          'autoConnect': false,
        },
      );

      s.onConnect((_) {
        if (kDebugMode) print('Socket connected to $url');
      });

      s.onConnectError((err) async {
        if (kDebugMode) print('Socket connect error to $url: $err');
        try {
          s.disconnect();
          s.dispose();
        } catch (_) {}
        // try next candidate
        attemptConnect(idx + 1);
      });

      s.onError((err) {
        if (kDebugMode) print('Socket error on $url: $err');
      });

      s.onDisconnect((_) {
        if (kDebugMode) print('Socket disconnected from $url');
      });

      // start connection
      s.connect();
    }

    attemptConnect(attempt);
  }

  void sendMessage(String text) {
    if (socket?.connected == true) {
      socket!.emit('send_message', {'text': text});
    } else {
      if (kDebugMode) print('sendMessage failed: socket not connected');
    }
  }

  Future<void> disconnect() async {
    try {
      socket?.disconnect();
      socket?.dispose();
      socket = null;
    } catch (_) {}
  }
}