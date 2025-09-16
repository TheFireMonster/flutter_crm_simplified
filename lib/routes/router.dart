import 'package:flutter_crm/views/pages/chat_page.dart';
import 'package:flutter_crm/views/pages/home_page.dart';
import 'package:flutter_crm/views/pages/login_page.dart';
import 'package:flutter_crm/views/pages/register_page.dart';
import 'package:flutter_crm/views/pages/appointments_page.dart';
import 'package:flutter_crm/views/pages/sales_page.dart';
import 'package:flutter_crm/views/pages/settings_page.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

final GoRouter router = GoRouter(
  redirect: (context, state) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('backend_token');
    final userRole = prefs.getString('user_role'); // optional role from backend
    final path = state.fullPath ?? '';

    // Paths that don't require authentication
    final publicPaths = ['/login', '/register'];

    // Paths restricted to specific roles (optional)
    final rolePaths = {
      '/sales': ['admin', 'manager'], // only these roles can access /sales
      '/settings': ['admin'],
    };

    // Not logged in -> redirect to login unless already on public paths
    if (token == null && !publicPaths.contains(path)) {
      return '/login';
    }

    // Logged in -> redirect away from login/register
    if (token != null && publicPaths.contains(path)) {
      return '/home';
    }

    // Role-based access control
    if (token != null && rolePaths.containsKey(path)) {
      final allowedRoles = rolePaths[path]!;
      if (userRole == null || !allowedRoles.contains(userRole)) {
        return '/home'; 
      }
    }

    return null;
  },
  routes: [
    GoRoute(path: '/', redirect: (context, state) => '/login'),
    GoRoute(path: '/home', builder: (context, state) => HomePage()),
    GoRoute(path: '/login', builder: (context, state) => LoginPage()),
    GoRoute(path: '/register', builder: (context, state) => RegisterPage()),
    GoRoute(path: '/appointments', builder: (context, state) => AppointmentsPage()),
    GoRoute(path: '/sales', builder: (context, state) => SalesPage()),
    GoRoute(path: '/chat', builder: (context, state) => ChatPage()),
    GoRoute(path: '/settings', builder: (context, state) => SettingsPage()),
  ],
);