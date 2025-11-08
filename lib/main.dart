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

  final uri = Uri.base;
  String? linkId;
  String? accessToken;
  if (uri.pathSegments.length >= 2 && uri.pathSegments[0] == 'chat') {
    linkId = uri.pathSegments[1];
    if (uri.pathSegments.length >= 3) {
      accessToken = uri.pathSegments[2];
    }
  }

  runApp(
    linkId != null && accessToken != null
      ? MaterialApp(
          home: ChatPageCustomer(conversationId: linkId, accessToken: accessToken),
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
