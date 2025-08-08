import 'package:flutter/material.dart';
import 'package:flutter_crm/views/pages/chat_page.dart';
import 'package:flutter_crm/views/pages/login_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool isDrawerOpen = false;

@override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter2'),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => LoginPage()),
              );
            },
            child: Text('Logout', style: TextStyle(color: Colors.white)),
          ),
          IconButton(
            icon: Icon(Icons.account_circle_rounded, color: Colors.white),
            onPressed: () {
              setState(() {
                isDrawerOpen = !isDrawerOpen;
              });
            },
          ),
        ],
      ),
      body: Row(
        children: [
          AnimatedContainer(
            duration: Duration(milliseconds: 500),
            width: isDrawerOpen ? 350 : 150,
            color: Colors.green[800],
            child: Stack(
              children: [
                isDrawerOpen
                    ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GestureDetector(
                          onTap: (){
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (context) => ChatPage()),
                            );
                          },
                          child: Text(
                            "Chat",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                        SizedBox(height: 10),
                        GestureDetector(
                          onTap: () {},
                          child: Text(
                            "Settings",
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    )
                    : Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Icon(Icons.chat, color: Colors.white, size: 30),
                        Icon(Icons.settings, color: Colors.white, size: 30),
                        Icon(Icons.settings, color: Colors.white, size: 30),
                      ],
                    ),
                Align(
                  alignment: Alignment.centerRight,
                  child: IconButton(
                    icon: Icon(
                      isDrawerOpen
                          ? Icons.arrow_back_ios
                          : Icons.arrow_forward_ios,
                      color: Colors.white,
                    ),
                    onPressed: () {
                      setState(() {
                        isDrawerOpen = !isDrawerOpen;
                      });
                    },
                  ),
                ),
              ],
            ),
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
