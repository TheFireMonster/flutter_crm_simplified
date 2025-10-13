import 'package:flutter/material.dart';
import 'package:flutter_crm/views/pages/chat_page.dart';
import 'package:flutter_crm/views/pages/sales_page.dart';
import 'package:flutter_crm/views/pages/settings_page.dart';
import 'package:go_router/go_router.dart';

class SideMenu extends StatefulWidget {
  final bool isDrawerOpen;
  final VoidCallback toggleDrawer;

  const SideMenu({
    super.key,
    required this.isDrawerOpen,
    required this.toggleDrawer,
  });

  @override
  State<SideMenu> createState() => _SideMenuState();
}

class _SideMenuState extends State<SideMenu> {
  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 500),
      width: widget.isDrawerOpen ? 350 : 50,
      color: Colors.green[800],
      child: Stack(
        children: [
          widget.isDrawerOpen
              ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: () => context.go('/chat'),
                    child: Text("Chat", style: TextStyle(color: Colors.white)),
                  ),
                  SizedBox(height: 10),
                  GestureDetector(
                    onTap: () => context.go('/settings'),
                    child: Text(
                      "Settings",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  SizedBox(height: 10),
                  GestureDetector(
                    onTap: () => context.go('/sales'),
                    child: Text(
                      "Sales",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  SizedBox(height: 10),
                  GestureDetector(
                    onTap: () => context.go('/appointments'),
                    child: Text(
                      "Appointments",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  SizedBox(height: 10),
                  GestureDetector(
                    onTap: () => context.go('/costumers'),
                    child: Text(
                      "Costumers",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  SizedBox(height: 10),
                  GestureDetector(
                    onTap: () => context.go('/services'),
                    child: Text(
                      "Services",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  SizedBox(height: 10),
                  GestureDetector(
                    onTap: () => context.go('/reports'),
                    child: Text(
                      "Reports",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              )
              : Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  IconButton(
                    icon: Icon(Icons.chat, color: Colors.white, size: 30),
                    onPressed: () => context.go('/chat'),
                  ),
                  IconButton(
                    icon: Icon(Icons.settings, color: Colors.white, size: 30),
                    onPressed: () => context.go('/settings'),
                  ),
                  IconButton(
                    icon: Icon(Icons.attach_money, color: Colors.white, size: 30),
                    onPressed: () => context.go('/sales'),
                  ),
                   IconButton(
                    icon: Icon(Icons.calendar_month, color: Colors.white, size: 30),
                    onPressed: () => context.go('/appointments')
                  ),
                    IconButton(
                      icon: Icon(Icons.people, color: Colors.white, size: 30),
                      onPressed: () => context.go('/costumers')
                    ),
                ],
              ),
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              icon: Icon(
                widget.isDrawerOpen
                    ? Icons.arrow_back_ios
                    : Icons.arrow_forward_ios,
                color: Colors.white,
              ),
              onPressed: widget.toggleDrawer,
            ),
          ),
        ],
      ),
    );
  }
}
