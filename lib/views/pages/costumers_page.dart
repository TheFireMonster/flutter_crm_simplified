import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class CostumersPage extends StatefulWidget {
  const CostumersPage({super.key});

  @override
  State<CostumersPage> createState() => _CostumersPageState();
}

class _CostumersPageState extends State<CostumersPage> {
  bool isDrawerOpen = false;

    void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _cpfController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _sourceController = TextEditingController();
  List<Map<String, dynamic>> _customers = [];

  Future<void> fetchCustomers() async {
  final resp = await Uri.parse('http://localhost:3000/customers');
    final response = await http.get(resp);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      setState(() {
        _customers = data.map<Map<String, dynamic>>((c) => Map<String, dynamic>.from(c)).toList();
      });
    }
  }

  Future<void> registerCustomer() async {
    if (!_formKey.currentState!.validate()) return;
  final resp = await Uri.parse('http://localhost:3000/customers');
    final response = await http.post(
      resp,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'cpf': _cpfController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'source': _sourceController.text.trim(),
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      _nameController.clear();
      _emailController.clear();
      _cpfController.clear();
      _phoneController.clear();
      _addressController.clear();
      _sourceController.clear();
      fetchCustomers();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Customer registered!')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error registering customer')));
    }
  }

  @override
  void initState() {
    super.initState();
    fetchCustomers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Costumers'),
      ),
      body: Row(
        children: [
          SideMenu(
            isDrawerOpen: isDrawerOpen,
            toggleDrawer: toggleDrawer,
          ),
          Expanded(
            child: Container(
              color: Colors.blue[50],
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [

                            TextFormField(
                              controller: _nameController,
                              decoration: InputDecoration(labelText: 'Name'),
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              controller: _emailController,
                              decoration: InputDecoration(labelText: 'Email'),
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              controller: _cpfController,
                              decoration: InputDecoration(labelText: 'CPF'),
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              controller: _phoneController,
                              decoration: InputDecoration(labelText: 'Phone'),
                            ),
                            TextFormField(
                              controller: _addressController,
                              decoration: InputDecoration(labelText: 'Address'),
                            ),
                            TextFormField(
                              controller: _sourceController,
                              decoration: InputDecoration(labelText: 'Source'),
                            ),
                            SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: registerCustomer,
                              child: Text('Register Customer'),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 32),
                      Text('Registered Customers:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        itemCount: _customers.length,
                        itemBuilder: (context, index) {
                          final c = _customers[index];
                          return Card(
                            child: ListTile(
                              title: Text(c['name'] ?? ''),
                              subtitle: Text('Email: ${c['email'] ?? ''}\nCPF: ${c['cpf'] ?? ''}'),
                              trailing: Text(c['phone'] ?? ''),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
