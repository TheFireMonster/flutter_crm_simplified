import 'package:flutter_crm/views/pages/chat_page.dart';
import 'package:flutter_crm/views/pages/home_page.dart';
import 'package:flutter_crm/views/pages/login_page.dart';
import 'package:flutter_crm/views/pages/register_page.dart';
import 'package:flutter_crm/views/pages/appointments_page.dart';
import 'package:flutter_crm/views/pages/sales_page.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_crm/views/pages/costumers_page.dart';
import 'package:flutter_crm/views/pages/services_page.dart';
import 'package:flutter_crm/views/pages/reports_page.dart';

final GoRouter router = GoRouter(
  redirect: (context, state) {
    final user = FirebaseAuth.instance.currentUser;
    final path = state.fullPath ?? '';

    final publicPaths = ['/login', '/register'];
    final isRegisterPath = path.startsWith('/register');

    if (user == null && !publicPaths.contains(path) && !isRegisterPath) {
      return '/login';
    }

    if (user != null && (publicPaths.contains(path) || isRegisterPath)) {
      return '/home';
    }

    return null;
  },
  routes: [
    GoRoute(path: '/', redirect: (context, state) => '/login'),
    GoRoute(path: '/home', builder: (context, state) => HomePage()),
    GoRoute(path: '/login', builder: (context, state) => LoginPage()),
    GoRoute(path: '/appointments', builder: (context, state) => AppointmentsPage()),
    GoRoute(path: '/sales', builder: (context, state) => SalesPage()),
    GoRoute(path: '/chat', builder: (context, state) => ChatPage()),
    GoRoute(path: '/costumers', builder: (context, state) => CostumersPage()),
    GoRoute(path: '/services', builder: (context, state) => ServicePage()),
    GoRoute(path: '/reports', builder: (context, state) => ReportsPage()),
    GoRoute(
      path: '/chat/:id',
      builder: (context, state) {
        final conversationId = state.pathParameters['id'] ?? '';
        return ChatPage(conversationId: conversationId);
      },
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => RegisterPage(),
    ),
    GoRoute(
      path: '/register/:token',
      builder: (context, state) {
        final token = state.pathParameters['token'];
        return RegisterPage(registrationCode: token);
      },
    ),
  ],
);