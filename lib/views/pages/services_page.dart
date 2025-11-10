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
  String description = '';
  bool isLoading = false;
  List<Map<String, dynamic>> services = [];

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  Future<void> fetchServices() async {
    try {
      final response = await http.get(Uri.parse('/services'));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is List) {
          setState(() {
            services = List<Map<String, dynamic>>.from(decoded);
          });
        }
      } else {
      }
  } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar serviços')),
        );
      }
    }
  }

  Future<void> registerService() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { isLoading = true; });
    try {
      final response = await http.post(
        Uri.parse('/services'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'serviceName': serviceName,
          'price': double.tryParse(price) ?? 0,
          'description': description.isNotEmpty ? description : null,
        }),
      );
      setState(() { isLoading = false; });
      if (response.statusCode == 201 || response.statusCode == 200) {
        _formKey.currentState!.reset();
        serviceName = '';
        price = '';
        description = '';
        await fetchServices();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Serviço registrado com sucesso!')),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Falha ao registrar serviço: ${response.statusCode}')),
        );
      }
    } catch (e) {
      setState(() { isLoading = false; });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao registrar serviço')),
      );
    }
  }

  Future<void> editService(int id, Map<String, dynamic> currentData) async {
    final nameController = TextEditingController(text: currentData['serviceName']);
    final priceController = TextEditingController(text: currentData['price']?.toString() ?? '');
    final descController = TextEditingController(text: currentData['description'] ?? '');

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Editar Serviço'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(labelText: 'Nome do Serviço'),
              ),
              TextField(
                controller: priceController,
                decoration: InputDecoration(labelText: 'Preço'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: descController,
                decoration: InputDecoration(labelText: 'Descrição'),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            style: TextButton.styleFrom(foregroundColor: Colors.green[700]),
            child: Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Salvar'),
          ),
        ],
      ),
    );

    if (result == true) {
      final response = await http.put(
        Uri.parse('/services/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'serviceName': nameController.text,
          'price': double.tryParse(priceController.text) ?? 0,
          'description': descController.text.isNotEmpty ? descController.text : null,
        }),
      );

      if (response.statusCode == 200) {
        await fetchServices();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Serviço atualizado com sucesso!')),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Falha ao atualizar serviço.')),
        );
      }
    }
  }

  Future<void> deleteService(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Excluir Serviço'),
        content: Text('Tem certeza que deseja excluir este serviço?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            style: TextButton.styleFrom(foregroundColor: Colors.green[700]),
            child: Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text('Excluir'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final response = await http.delete(Uri.parse('/services/$id'));
      if (response.statusCode == 200) {
        await fetchServices();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Serviço excluído com sucesso!')),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Falha ao excluir serviço.')),
        );
      }
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
        title: const Text('Serviços'),
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
                        Text(
                          'Registrar Novo Serviço',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 16),
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
                                  decoration: InputDecoration(labelText: 'Nome do Serviço'),
                                  onChanged: (val) => serviceName = val,
                                  validator: (val) => val == null || val.isEmpty ? 'Obrigatório' : null,
                                ),
                                TextFormField(
                                  decoration: InputDecoration(labelText: 'Preço'),
                                  keyboardType: TextInputType.number,
                                  onChanged: (val) => price = val,
                                  validator: (val) => val == null || val.isEmpty ? 'Obrigatório' : null,
                                ),
                                TextFormField(
                                  decoration: InputDecoration(labelText: 'Descrição (opcional)'),
                                  maxLines: 3,
                                  onChanged: (val) => description = val,
                                ),
                                SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: isLoading ? null : registerService,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green[300],
                                  ),
                                  child: isLoading 
                                    ? CircularProgressIndicator() 
                                    : Text(
                                        'Registrar',
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
                      Text(
                        'Serviços Registrados',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 16),
                      services.isEmpty
                          ? Text('Nenhum serviço registrado ainda.')
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: services.length,
                              itemBuilder: (context, idx) {
                                final s = services[idx];
                                return Card(
                                  child: ListTile(
                                    title: Text(s['serviceName'] ?? ''),
                                    subtitle: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Preço: R\$ ${s['price']}'),
                                        if (s['description'] != null && s['description'].toString().isNotEmpty)
                                          Text('Descrição: ${s['description']}', style: TextStyle(fontSize: 12, color: Colors.grey[700])),
                                      ],
                                    ),
                                    trailing: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        IconButton(
                                          icon: Icon(Icons.edit, color: Colors.blue),
                                          onPressed: () => editService(s['id'], s),
                                        ),
                                        IconButton(
                                          icon: Icon(Icons.delete, color: Colors.red),
                                          onPressed: () => deleteService(s['id']),
                                        ),
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