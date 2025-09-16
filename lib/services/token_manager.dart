import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class TokenManager {
  static const String backendTokenKey = 'backend_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String tokenExpiryKey = 'token_expiry';
  static const String userRolesKey = 'user_roles';

  static Future<bool> isTokenValid() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(backendTokenKey);
    final expiry = prefs.getInt(tokenExpiryKey);

    if (token == null || expiry == null) return false;
    return DateTime.now().millisecondsSinceEpoch < expiry;
  }

  static Future<void> saveToken(String token, int expiry, {String? refreshToken, List<String>? roles}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(backendTokenKey, token);
    await prefs.setInt(tokenExpiryKey, expiry);
    if (refreshToken != null) await prefs.setString(refreshTokenKey, refreshToken);
    if (roles != null) await prefs.setStringList(userRolesKey, roles);
  }

  static Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(backendTokenKey);
    await prefs.remove(refreshTokenKey);
    await prefs.remove(tokenExpiryKey);
    await prefs.remove(userRolesKey);
  }

  static Future<String?> getToken() async {
    await refreshTokenIfNeeded();
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(backendTokenKey);
  }

  static Future<List<String>> getRoles() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(userRolesKey) ?? [];
  }

  static Future<void> refreshTokenIfNeeded() async {
    final valid = await isTokenValid();
    if (valid) return;

    final prefs = await SharedPreferences.getInstance();
    final refreshToken = prefs.getString(refreshTokenKey);
    if (refreshToken == null) {
      await clearTokens();
      return;
    }

    final response = await http.post(
      Uri.parse('http://localhost:3000/auth/refresh-token'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh_token': refreshToken}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveToken(
        data['token'],
        data['expiry'],
        refreshToken: data['refresh_token'],
        roles: data['roles'] != null ? List<String>.from(data['roles']) : [],
      );
    } else {
      await clearTokens();
    }
  }
}