import 'package:flutter/material.dart';
import 'package:flutter_crm/routes/router.dart';
import 'package:flutter_crm/views/pages/chat_page_customer.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'firebase_options.dart';
import 'package:intl/intl.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Intl.defaultLocale = 'pt_BR';

  await initializeDateFormatting(Intl.defaultLocale, null);

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // For Flutter web: extract linkId from URL if present
  final uri = Uri.base;
  String? linkId;
  if (uri.pathSegments.length >= 2 && uri.pathSegments[0] == 'chat') {
    linkId = uri.pathSegments[1];
  }

  runApp(
    linkId != null
      ? MaterialApp(
          home: ChatPageCustomer(conversationId: linkId),
          debugShowCheckedModeBanner: false,
        )
      : const MyApp()
  );
}

String title = 'Flutter';


class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        scaffoldBackgroundColor: Colors.green[50],
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.green[800],
          titleTextStyle: TextStyle(color: Colors.white, fontSize: 20),
          centerTitle: true,
        ),
      ),
    );
  }
}
