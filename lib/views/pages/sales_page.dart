import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';

class SalesPage extends StatefulWidget {
  const SalesPage({super.key});

  @override
  State<SalesPage> createState() => _SalesPageState();
}

class _SalesPageState extends State<SalesPage> {
  bool isDrawerOpen = false;

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    List<dynamic> sales = [];
    return Scaffold(
      appBar: AppBar(title: Text('Sales Page'), centerTitle: true),
      body: Row(
        children: [
          SideMenu(isDrawerOpen: isDrawerOpen, toggleDrawer: toggleDrawer),
          Expanded(
            child: ListView.builder(
              itemCount: sales.length,
              itemBuilder: (context, index) {
                final sale = sales[index];
                return Card(
                  margin: const EdgeInsets.all(8),
                  child: ListTile(
                    title: Text("Cliente: ${sale['customer']['name']}"),
                    subtitle: Text("Total: R\$${sale['total']}"),
                    trailing: Text(sale['createdAt']),
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
