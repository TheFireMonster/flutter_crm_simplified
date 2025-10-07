

import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ServicesProductsPage extends StatefulWidget {
  const ServicesProductsPage({super.key});

  @override
  State<ServicesProductsPage> createState() => _ServicesProductsPageState();
}

class _ServicesProductsPageState extends State<ServicesProductsPage> {
  bool isDrawerOpen = false;
  final _formKey = GlobalKey<FormState>();
  String productName = '';
  String amount = '';
  String customerName = '';
  String customerEmail = '';
  bool isLoading = false;
  List<Map<String, dynamic>> products = [];

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  Future<void> fetchProducts() async {
    final response = await http.get(Uri.parse('http://localhost:3000/sales'));
    if (response.statusCode == 200) {
      setState(() {
        products = List<Map<String, dynamic>>.from(json.decode(response.body));
      });
    }
  }

  Future<void> registerProduct() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { isLoading = true; });
    final response = await http.post(
      Uri.parse('http://localhost:3000/sales'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'productName': productName,
        'amount': double.tryParse(amount) ?? 0,
        'customerName': customerName.isNotEmpty ? customerName : null,
        'customerEmail': customerEmail.isNotEmpty ? customerEmail : null,
      }),
    );
    setState(() { isLoading = false; });
    if (response.statusCode == 201 || response.statusCode == 200) {
      _formKey.currentState!.reset();
      productName = '';
      amount = '';
      customerName = '';
      customerEmail = '';
      await fetchProducts();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Product/Service registered successfully!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to register product/service.')),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    fetchProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Services & Products'),
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
                        'Register New Service/Product',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 16),
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              decoration: InputDecoration(labelText: 'Product/Service Name'),
                              onChanged: (val) => productName = val,
                              validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              decoration: InputDecoration(labelText: 'Amount'),
                              keyboardType: TextInputType.number,
                              onChanged: (val) => amount = val,
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
                              onPressed: isLoading ? null : registerProduct,
                              child: isLoading ? CircularProgressIndicator() : Text('Register'),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 32),
                      Text(
                        'Registered Services & Products',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 16),
                      products.isEmpty
                          ? Text('No products/services registered yet.')
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: products.length,
                              itemBuilder: (context, idx) {
                                final p = products[idx];
                                return Card(
                                  child: ListTile(
                                    title: Text(p['productName'] ?? ''),
                                    subtitle: Text('Amount: ${p['amount']}'),
                                    trailing: Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        if (p['customerName'] != null)
                                          Text('Customer: ${p['customerName']}'),
                                        if (p['customerEmail'] != null)
                                          Text('Email: ${p['customerEmail']}'),
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