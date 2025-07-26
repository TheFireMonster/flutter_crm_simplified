import 'package:flutter/material.dart';
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
        ],
      ),
      body: Row(
        children: [
          AnimatedContainer(
            duration: Duration(milliseconds: 500),
            width: isDrawerOpen ? 250 : 60,
            color: Colors.green[800],
            child: Stack(
              children: [
                if (isDrawerOpen)
                  Positioned(
                    left: 20,
                    top: 100,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Item 1", style: TextStyle(color: Colors.white)),
                        SizedBox(height: 10),
                        Text("Item 2", style: TextStyle(color: Colors.white)),
                      ],
                    ),
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

          // This container likely shouldn't be 600 wide inside a Row. Adjusted for layout.
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
