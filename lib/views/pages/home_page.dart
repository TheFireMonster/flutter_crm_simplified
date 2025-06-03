import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter2'), 
        centerTitle: true,

      ),
      body: Row(
        children: [

          Container(
            width: 100,
            color: Colors.green[800],
          ),

          Container(
            width: 600,
            color: Colors.green[50],
          ),

          Expanded(
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
        ],
      ),
    );
  }
}
