import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
// go_router unused here
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
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
  final TextEditingController _dateOfBirthController = TextEditingController();
  final TextEditingController _stateController = TextEditingController();
  final TextEditingController _cepController = TextEditingController();
  List<Map<String, dynamic>> _customers = [];

  Future<void> fetchCustomers() async {
    final uri = Uri.parse('/customers');
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      if (!mounted) return;
      setState(() {
        _customers = data.map<Map<String, dynamic>>((c) => Map<String, dynamic>.from(c)).toList();
      });
      // merge in any chat-created customers that are stored locally
      await _mergeChatCustomersIfAny();
    }
  }

  Future<void> _loadChatCustomers() async {
    final prefs = await SharedPreferences.getInstance();
    final idsJson = prefs.getString('customerIds');
    final namesJson = prefs.getString('customerNames');
    if (idsJson == null || namesJson == null) return;
    try {
      final Map<String, dynamic> ids = jsonDecode(idsJson);
      final Map<String, dynamic> names = jsonDecode(namesJson);
      final chatCustomers = <Map<String, dynamic>>[];
      ids.forEach((linkId, custId) {
        final name = names[linkId]?.toString() ?? '';
        if (custId != null && custId.toString().isNotEmpty) {
          chatCustomers.add({'id': custId, 'name': name});
        }
      });
      if (!mounted) return;
      setState(() {
        final existingIds = _customers.map((c) => c['id']?.toString()).toSet();
        for (final c in chatCustomers) {
          final cid = c['id']?.toString();
          if (cid == null) continue;
          if (!existingIds.contains(cid)) {
            _customers.add(c);
            existingIds.add(cid);
          }
        }
      });
    } catch (_) {}
  }

  Future<void> _mergeChatCustomersIfAny() async {
    final prefs = await SharedPreferences.getInstance();
    final idsJson = prefs.getString('customerIds');
    final namesJson = prefs.getString('customerNames');
    if (idsJson == null || namesJson == null) return;
    try {
      final Map<String, dynamic> ids = jsonDecode(idsJson);
      final Map<String, dynamic> names = jsonDecode(namesJson);
      final existingIds = _customers.map((c) => c['id']?.toString()).toSet();
      for (final entry in ids.entries) {
        final linkId = entry.key;
        final custId = entry.value;
        final name = names[linkId]?.toString() ?? '';
        final custIdStr = custId?.toString();
        if (custIdStr == null || custIdStr.isEmpty) continue;
        if (!existingIds.contains(custIdStr)) {
          _customers.add({'id': custId, 'name': name});
          existingIds.add(custIdStr);
        }
      }
      if (mounted) setState(() {});
    } catch (_) {}
  }

  Future<void> registerCustomer() async {
    if (!_formKey.currentState!.validate()) return;
    final uri = Uri.parse('/customers');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'cpf': _cpfController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'source': _sourceController.text.trim(),
        'dateOfBirth': _dateOfBirthController.text.trim(),
        'state': _stateController.text.trim(),
        'cep': _cepController.text.trim(),
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
  _nameController.clear();
  _emailController.clear();
  _cpfController.clear();
  _phoneController.clear();
  _addressController.clear();
  _sourceController.clear();
  _dateOfBirthController.clear();
  _stateController.clear();
  _cepController.clear();
      await fetchCustomers();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Customer registered!')));
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error registering customer')));
    }
  }

  Future<void> updateCustomer(int id) async {
    if (!_formKey.currentState!.validate()) return;
    final uri = Uri.parse('/customers/$id');
    final response = await http.put(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'cpf': _cpfController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'source': _sourceController.text.trim(),
        'dateOfBirth': _dateOfBirthController.text.trim(),
        'state': _stateController.text.trim(),
        'cep': _cepController.text.trim(),
      }),
    );
    if (response.statusCode == 200) {
      _clearFormFields();
      await fetchCustomers();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Customer updated')));
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error updating customer')));
    }
  }

  void _openEditCustomer(Map<String, dynamic> customer) {
    // populate controllers
    _nameController.text = (customer['name'] ?? '').toString();
    _emailController.text = (customer['email'] ?? '').toString();
    _cpfController.text = (customer['cpf'] ?? '').toString();
    _phoneController.text = (customer['phone'] ?? '').toString();
    _addressController.text = (customer['address'] ?? '').toString();
    _sourceController.text = (customer['source'] ?? '').toString();
    _dateOfBirthController.text = (customer['dateOfBirth'] ?? '').toString();
    _stateController.text = (customer['state'] ?? '').toString();
    _cepController.text = (customer['cep'] ?? '').toString();

    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Edit customer'),
          content: SingleChildScrollView(
            child: Column(
              children: [
                TextFormField(controller: _nameController, decoration: InputDecoration(labelText: 'Name')),
                TextFormField(controller: _emailController, decoration: InputDecoration(labelText: 'Email')),
                TextFormField(controller: _cpfController, decoration: InputDecoration(labelText: 'CPF')),
                TextFormField(controller: _dateOfBirthController, decoration: InputDecoration(labelText: 'Date of Birth')),
                TextFormField(controller: _stateController, decoration: InputDecoration(labelText: 'State')),
                TextFormField(controller: _cepController, decoration: InputDecoration(labelText: 'CEP')),
                TextFormField(controller: _phoneController, decoration: InputDecoration(labelText: 'Phone')),
                TextFormField(controller: _addressController, decoration: InputDecoration(labelText: 'Address')),
                TextFormField(controller: _sourceController, decoration: InputDecoration(labelText: 'Source')),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () { _clearFormFields(); Navigator.of(context).pop(); }, child: Text('Cancel')),
            ElevatedButton(onPressed: () async {
              Navigator.of(context).pop();
              final id = customer['id'];
              if (id != null) await updateCustomer(int.tryParse(id.toString()) ?? id);
            }, child: Text('Save')),
          ],
        );
      }
    );
  }

  void _confirmDeleteCustomer(Map<String, dynamic> customer) {
    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Delete customer?'),
          content: Text('Are you sure you want to delete "${customer['name'] ?? ''}"? This cannot be undone.'),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(), child: Text('Cancel')),
            ElevatedButton(onPressed: () async {
              Navigator.of(context).pop();
              final id = customer['id'];
              if (id != null) await _deleteCustomer(int.tryParse(id.toString()) ?? id);
            }, child: Text('Delete')),
          ],
        );
      }
    );
  }

  Future<void> _deleteCustomer(int id) async {
    final uri = Uri.parse('/customers/$id');
    final resp = await http.delete(uri);
    if (resp.statusCode == 200 || resp.statusCode == 204) {
      await fetchCustomers();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Customer deleted')));
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error deleting customer')));
    }
  }

  void _clearFormFields() {
    _nameController.clear();
    _emailController.clear();
    _cpfController.clear();
    _phoneController.clear();
    _addressController.clear();
    _sourceController.clear();
    _dateOfBirthController.clear();
    _stateController.clear();
    _cepController.clear();
  }

  @override
  void initState() {
    super.initState();
    fetchCustomers();
    _loadChatCustomers();
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
                              controller: _dateOfBirthController,
                              decoration: InputDecoration(labelText: 'Date of Birth (DD/MM/AAAA)'),
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              controller: _stateController,
                              decoration: InputDecoration(labelText: 'State (e.g. SC)'),
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            TextFormField(
                              controller: _cepController,
                              decoration: InputDecoration(labelText: 'CEP'),
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
                              subtitle: Text(
                                'Email: ${c['email'] ?? ''}\nCPF: ${c['cpf'] ?? ''}\nDate of Birth: ${c['dateOfBirth'] ?? ''}\nState: ${c['state'] ?? ''}\nCEP: ${c['cep'] ?? ''}'
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(c['phone'] ?? ''),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: Icon(Icons.edit, size: 20),
                                    tooltip: 'Edit',
                                    onPressed: () => _openEditCustomer(c),
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.delete, size: 20),
                                    tooltip: 'Delete',
                                    onPressed: () => _confirmDeleteCustomer(c),
                                  ),
                                ],
                              ),
                              onTap: () => _openEditCustomer(c),
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
