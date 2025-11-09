import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
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
    }
  }

  // Removed _loadChatCustomers: all customer data is now fetched from backend

  // Removed _mergeChatCustomersIfAny: all customer data is now fetched from backend

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
    if (!mounted) return;
    if (response.statusCode == 200 || response.statusCode == 201) {
      _clearFormFields();
      await fetchCustomers();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Cliente registrado!')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao registrar cliente')));
    }
  }

  Future<void> updateCustomer(dynamic id) async {
    if (!_formKey.currentState!.validate()) return;
    final uri = Uri.parse('/customers/${id.toString()}');
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
    if (!mounted) return;
    if (response.statusCode == 200) {
      _clearFormFields();
      await fetchCustomers();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Cliente atualizado')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao atualizar cliente')));
    }
  }

  void _openEditCustomer(Map<String, dynamic> customer) {
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
          title: Text('Editar cliente'),
          content: SingleChildScrollView(
            child: Column(
              children: [
                TextFormField(controller: _nameController, decoration: InputDecoration(labelText: 'Nome')),
                TextFormField(controller: _emailController, decoration: InputDecoration(labelText: 'Email')),
                TextFormField(controller: _cpfController, decoration: InputDecoration(labelText: 'CPF')),
                TextFormField(controller: _dateOfBirthController, decoration: InputDecoration(labelText: 'Data de Nascimento')),
                TextFormField(controller: _stateController, decoration: InputDecoration(labelText: 'Estado')),
                TextFormField(controller: _cepController, decoration: InputDecoration(labelText: 'CEP')),
                TextFormField(controller: _phoneController, decoration: InputDecoration(labelText: 'Telefone')),
                TextFormField(controller: _addressController, decoration: InputDecoration(labelText: 'Endereço')),
                TextFormField(controller: _sourceController, decoration: InputDecoration(labelText: 'Origem')),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () { _clearFormFields(); Navigator.of(context).pop(); },
              style: TextButton.styleFrom(foregroundColor: Colors.green[700]),
              child: Text('Cancelar'),
            ),
            ElevatedButton(onPressed: () async {
              Navigator.of(context).pop();
              final id = customer['id'];
              if (id != null) await updateCustomer(id);
            }, child: Text('Salvar')),
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
          title: Text('Excluir cliente?'),
          content: Text('Tem certeza que deseja excluir "${customer['name'] ?? ''}"? Esta ação não pode ser desfeita.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              style: TextButton.styleFrom(foregroundColor: Colors.green[700]),
              child: Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(context).pop();
                final id = customer['id'];
                if (id != null) await _deleteCustomer(id);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: Text('Excluir'),
            ),
          ],
        );
      }
    );
  }

  Future<void> _deleteCustomer(dynamic id) async {
    final uri = Uri.parse('/customers/${id.toString()}');
    final resp = await http.delete(uri);
    if (!mounted) return;
    setState(() {
      _customers.removeWhere((c) => c['id'].toString() == id.toString());
    });
    if (!mounted) return;
    if (resp.statusCode == 200 || resp.statusCode == 204) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Cliente excluído')));
    } else if (resp.statusCode == 404) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Cliente não encontrado (já foi excluído)')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao excluir cliente: ${resp.statusCode}')));
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Clientes'),
        centerTitle: true,
      ),
      body: Row(
        children: [
          SideMenu(
            isDrawerOpen: isDrawerOpen,
            toggleDrawer: toggleDrawer,
          ),
          Expanded(
            child: SingleChildScrollView(
              child: Center(
                child: Container(
                    constraints: BoxConstraints(maxWidth: 800),
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                            side: BorderSide(color: Colors.black12, width: 1),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                children: [
                                  TextFormField(
                                  controller: _nameController,
                                  decoration: InputDecoration(labelText: 'Nome'),
                                ),
                                TextFormField(
                                  controller: _emailController,
                                  decoration: InputDecoration(labelText: 'Email'),
                                ),
                                TextFormField(
                                  controller: _cpfController,
                                  decoration: InputDecoration(labelText: 'CPF'),
                                ),
                                TextFormField(
                                  controller: _dateOfBirthController,
                                  decoration: InputDecoration(labelText: 'Data de Nascimento (DD/MM/AAAA)'),
                                ),
                                TextFormField(
                                  controller: _stateController,
                                  decoration: InputDecoration(labelText: 'Estado (ex: SC)'),
                                ),
                                TextFormField(
                                  controller: _cepController,
                                  decoration: InputDecoration(labelText: 'CEP'),
                                ),
                                TextFormField(
                                  controller: _phoneController,
                                  decoration: InputDecoration(labelText: 'Telefone'),
                                ),
                                TextFormField(
                                  controller: _addressController,
                                  decoration: InputDecoration(labelText: 'Endereço'),
                                ),
                                TextFormField(
                                  controller: _sourceController,
                                  decoration: InputDecoration(labelText: 'Origem'),
                                ),
                                SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: registerCustomer,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green[300],
                                  ),
                                  child: Text(
                                    'Registrar Cliente',
                                    style: TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 32),
                      Text('Clientes Registrados:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
                                'Email: ${c['email'] ?? ''}\nCPF: ${c['cpf'] ?? ''}\nData de Nascimento: ${c['dateOfBirth'] ?? ''}\nEstado: ${c['state'] ?? ''}\nCEP: ${c['cep'] ?? ''}'
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(c['telefone'] ?? ''),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: Icon(Icons.edit, size: 20),
                                    tooltip: 'Editar',
                                    onPressed: () => _openEditCustomer(c),
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.delete, size: 20),
                                    tooltip: 'Deletar',
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
