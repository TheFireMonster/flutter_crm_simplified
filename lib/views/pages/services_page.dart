import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ServicePage extends StatefulWidget {
  const ServicePage({super.key});

  @override
  State<ServicePage> createState() => _ServicePageState();
}

class _ServicePageState extends State<ServicePage> {
  bool isDrawerOpen = false;
  final _formKey = GlobalKey<FormState>();
  String serviceName = '';
  String price = '';
  String customerName = '';
  String customerEmail = '';
  bool isLoading = false;
  List<Map<String, dynamic>> services = [];

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  Future<void> fetchServices() async {
    final response = await http.get(Uri.parse('/services'));
    if (response.statusCode == 200) {
      setState(() {
        services = List<Map<String, dynamic>>.from(json.decode(response.body));
      });
    }
  }

  Future<void> registerService() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { isLoading = true; });
    final response = await http.post(
      Uri.parse('/services'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'serviceName': serviceName,
        'price': double.tryParse(price) ?? 0,
        'customerName': customerName.isNotEmpty ? customerName : null,
        'customerEmail': customerEmail.isNotEmpty ? customerEmail : null,
      }),
    );
    setState(() { isLoading = false; });
    if (response.statusCode == 201 || response.statusCode == 200) {
      _formKey.currentState!.reset();
  serviceName = '';
  price = '';
      customerName = '';
      customerEmail = '';
      await fetchServices();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Service registered successfully!')),
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to register service.')),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    fetchServices();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Services'),
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
                      Text(
                        'Register New Service',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 16),
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              decoration: InputDecoration(labelText: 'Service Name'),
                              onChanged: (val) => serviceName = val,
                              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              decoration: InputDecoration(labelText: 'Price'),
                              keyboardType: TextInputType.number,
                              onChanged: (val) => price = val,
                              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              decoration: InputDecoration(labelText: 'Customer Name (optional)'),
                              onChanged: (val) => customerName = val,
                            ),
                            TextFormField(
                              decoration: InputDecoration(labelText: 'Customer Email (optional)'),
                              onChanged: (val) => customerEmail = val,
                            ),
                            SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: isLoading ? null : registerService,
                              child: isLoading ? CircularProgressIndicator() : Text('Register'),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 32),
                      Text(
                        'Registered Services',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 16),
                      services.isEmpty
                          ? Text('No services registered yet.')
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: services.length,
                              itemBuilder: (context, idx) {
                                final s = services[idx];
                                return Card(
                                  child: ListTile(
                                    title: Text(s['serviceName'] ?? ''),
                                    subtitle: Text('Price: ${s['price']}'),
                                    trailing: Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        if (s['customerName'] != null)
                                          Text('Customer: ${s['customerName']}'),
                                        if (s['customerEmail'] != null)
                                          Text('Email: ${s['customerEmail']}'),
                                      ],
                                    ),
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