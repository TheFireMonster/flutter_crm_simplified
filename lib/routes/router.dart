import 'package:flutter/material.dart';
import 'package:flutter_crm/views/pages/chat_page.dart';
import 'package:go_router/go_router.dart';
import '../views/pages/home_page.dart';
import '../views/pages/login_page.dart  ';
import '../views/pages/register_page.dart';
import '../views/pages/appointments_page.dart';
import '../views/pages/sales_page.dart';
import '../views/pages/settings_page.dart';

final GoRouter router = GoRouter(
  routes: [
    GoRoute(path:'/', redirect: (context, state) => '/login'),
    GoRoute(path: '/home', builder: (context, state) => HomePage()),
    GoRoute(path: '/login', builder: (context, state) => LoginPage()),
    GoRoute(path: '/register', builder: (context, state) => RegisterPage()),
    GoRoute(path: '/appointments', builder: (context, state) => AppointmentsPage()),
    GoRoute(path: '/sales', builder: (context, state) => SalesPage()),
    GoRoute(path: '/chat', builder: (context, state) => ChatPage()),
    GoRoute(path: '/settings', builder: (context, state) => SettingsPage()),

  ]);
