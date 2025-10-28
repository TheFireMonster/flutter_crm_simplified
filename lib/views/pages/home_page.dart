import 'package:flutter/material.dart';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:go_router/go_router.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool isDrawerOpen = false;

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('CRM  '),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () async {
              final router = GoRouter.of(context);
              await FirebaseAuth.instance.signOut();
              if (!mounted) return;
              router.go('/login');
            },
            child: Text('Logout', style: TextStyle(color: Colors.white)),
          ),
          IconButton(
            icon: Icon(Icons.account_circle_rounded, color: Colors.white),
            onPressed: toggleDrawer,
          ),
        ],
      ),
      body: Row(
        children: [
          SideMenu(
            isDrawerOpen: isDrawerOpen,
            toggleDrawer: toggleDrawer,
            ),
        ],
      ),
    );
  }
}
