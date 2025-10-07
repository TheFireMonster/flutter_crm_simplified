import 'package:flutter/material.dart';

import 'package:flutter_crm/views/pages/login_page.dart';
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
        title: Text('Flutter2'),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              if (!mounted) return;
              context.go('/login');
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
          Expanded(
            child: Container(
              color: Colors.green[50],
              child: ListView.builder(
                itemCount: 5,
                itemBuilder: (BuildContext context, int index) {
                  return Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Container(
                      color: Colors.lightGreenAccent,
                      height: 120,
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
