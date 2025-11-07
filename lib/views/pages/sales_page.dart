import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SalesPage extends StatefulWidget {
  const SalesPage({super.key});

  @override
  State<SalesPage> createState() => _SalesPageState();
}

class _SalesPageState extends State<SalesPage> {
  bool isDrawerOpen = false;
  List<dynamic> sales = [];
  bool loading = false;
  String? errorMessage;
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _serviceController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _customerNameController = TextEditingController();
  final TextEditingController _customerEmailController = TextEditingController();
  Map<String, String> _chatCustomerNames = {}; // linkId -> name
  String? _selectedChatCustomerLinkId;
  Map<String, String> _chatCustomerIds = {}; // linkId -> backend customerId as string
  List<dynamic> _services = [];
  int? _selectedServiceId;

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  @override
  void initState() {
    super.initState();
    fetchSales();
    _loadChatCustomers();
    _loadServices();
  }

  Future<void> _loadServices() async {
    try {
      final uri = Uri.parse('/services');
      final resp = await http.get(uri);
      if (resp.statusCode == 200) {
        final decoded = jsonDecode(resp.body);
        List<dynamic> data;
        if (decoded is Map && decoded.containsKey('value')) {
          data = List<dynamic>.from(decoded['value']);
        } else if (decoded is Map && decoded.containsKey('data')) {
          data = List<dynamic>.from(decoded['data']);
        } else if (decoded is List) {
          data = List<dynamic>.from(decoded);
        } else {
          data = [];
        }
        _services = data;
        if (_services.isNotEmpty) {
        }
        if (mounted) setState(() {});
      }
    } catch (e) {
      if (mounted) setState(() { errorMessage = 'Failed to load services: $e'; });
    }
  }

  Future<void> _loadChatCustomers() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final namesJson = prefs.getString('customerNames');
      if (namesJson != null) {
        final Map<String, dynamic> map = jsonDecode(namesJson);
        _chatCustomerNames = map.map((k, v) => MapEntry(k, v.toString()));
        if (_chatCustomerNames.isNotEmpty) _selectedChatCustomerLinkId = _chatCustomerNames.keys.first;
        if (mounted) setState(() {});
      }
      final idsJson = prefs.getString('customerIds');
      if (idsJson != null) {
        final Map<String, dynamic> idmap = jsonDecode(idsJson);
        _chatCustomerIds = idmap.map((k, v) => MapEntry(k, v.toString()));
      }
    } catch (e) {
      if (mounted) setState(() { errorMessage = 'Failed loading chat customers: $e'; });
    }
  }

  Future<void> fetchSales() async {
    setState(() {
      loading = true;
    });
    try {
      final uri = Uri.parse('/sales');
      final resp = await http.get(uri);
      if (resp.statusCode == 200) {
        final decoded = jsonDecode(resp.body);
        List<dynamic> data;
        if (decoded is Map && decoded.containsKey('value')) {
          data = List<dynamic>.from(decoded['value']);
        } else if (decoded is Map && decoded.containsKey('data')) {
          data = List<dynamic>.from(decoded['data']);
        } else if (decoded is List) {
          data = List<dynamic>.from(decoded);
        } else {
          data = [];
        }
        if (!mounted) return;
        setState(() {
          sales = data;
        });
      }
    } catch (e) {
      if (mounted) setState(() { errorMessage = 'Failed to load sales: $e'; });
    } finally {
      if (mounted) setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Vendas'), centerTitle: true),
      body: Row(
        children: [
          SideMenu(isDrawerOpen: isDrawerOpen, toggleDrawer: toggleDrawer),
          Expanded(
            child: loading
                ? Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                    physics: AlwaysScrollableScrollPhysics(),
                    child: Center(
                      child: Container(
                        constraints: BoxConstraints(maxWidth: 800),
                        child: Column(
                          children: [
                            if (errorMessage != null) ...[
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Card(
                                  color: Colors.red[50],
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(errorMessage!, style: TextStyle(color: Colors.red[800])),
                                  ),
                                ),
                              ),
                            ],
                            Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Card(
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
                                      crossAxisAlignment: CrossAxisAlignment.stretch,
                                      children: [
                                    Text('Registrar venda de serviço', style: Theme.of(context).textTheme.titleMedium),
                                    const SizedBox(height: 8),
                                // Services dropdown (optional). Selecting fills service + price.
                                _services.isEmpty
                                    ? TextFormField(
                                        controller: _serviceController,
                                        decoration: InputDecoration(labelText: 'Serviço'),
                                        validator: (v) => (v == null || v.isEmpty) ? 'Obrigatório' : null,
                                      )
                                    : DropdownButtonFormField<int>(
                                        initialValue: _selectedServiceId,
                                        decoration: InputDecoration(labelText: 'Selecionar serviço (ou Outro)'),
                                        items: [
                                          DropdownMenuItem<int>(value: 0, child: Text('Outro / personalizado')),
                                          ..._services.map((s) {
                                            final id = (s['id'] ?? s['Id'] ?? s['ID']) as dynamic;
                                            final name = s['serviceName'] ?? s['service_name'] ?? s['name'] ?? '';
                                            final parsedId = id is int ? id : int.tryParse(id.toString());
                                            return DropdownMenuItem<int>(value: parsedId, child: Text(name));
                                          }),
                                        ],
                                        onChanged: (v) {
                                          setState(() {
                                            _selectedServiceId = v;
                                            if (v == null || v == 0) {
                                              _serviceController.clear();
                                              _priceController.clear();
                                            } else {
                                              dynamic found;
                                              for (var s in _services) {
                                                final id = (s['id'] ?? s['Id'] ?? s['ID']) as dynamic;
                                                final matches = id is int ? id == v : id.toString() == v.toString();
                                                if (matches) {
                                                  found = s;
                                                  break;
                                                }
                                              }
                                              if (found != null) {
                                                _serviceController.text = (found['serviceName'] ?? found['service_name'] ?? '').toString();
                                                final p = found['price'] ?? found['Price'] ?? found['price'];
                                                _priceController.text = p != null ? p.toString() : '';
                                              }
                                            }
                                          });
                                        },
                                        validator: (v) {
                                          // if user picked 'Other' or nothing, ensure manual field is filled
                                          if ((v == null || v == 0) && (_serviceController.text.trim().isEmpty)) return 'Obrigatório';
                                          return null;
                                        },
                                      ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _priceController,
                                  decoration: InputDecoration(labelText: 'Preço'),
                                  keyboardType: TextInputType.numberWithOptions(decimal: true),
                                  validator: (v) => (v == null || v.isEmpty) ? 'Obrigatório' : null,
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextFormField(
                                        controller: _customerNameController,
                                        decoration: InputDecoration(labelText: 'Nome do cliente (opcional)'),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    _chatCustomerNames.isEmpty
                                        ? SizedBox.shrink()
                                        : DropdownButton<String>(
                                            value: _selectedChatCustomerLinkId,
                                            hint: Text('Escolher conversa'),
                                            items: _chatCustomerNames.entries
                                                .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                                                .toList(),
                                            onChanged: (v) {
                                              setState(() {
                                                _selectedChatCustomerLinkId = v;
                                                if (v != null) _customerNameController.text = _chatCustomerNames[v] ?? '';
                                              });
                                            },
                                          ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                TextFormField(
                                  controller: _customerEmailController,
                                  decoration: InputDecoration(labelText: 'Email do cliente (opcional)'),
                                  keyboardType: TextInputType.emailAddress,
                                ),
                                const SizedBox(height: 12),
                                ElevatedButton(
                                  onPressed: _createSale,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green[300],
                                  ),
                                  child: Text(
                                    'Criar venda',
                                    style: TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Divider(),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                        sales.isEmpty
                            ? Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Text('Nenhuma venda ainda'),
                              )
                            : RefreshIndicator(
                                onRefresh: fetchSales,
                                child: ListView.builder(
                                  shrinkWrap: true,
                                  physics: NeverScrollableScrollPhysics(),
                                  itemCount: sales.length,
                                  itemBuilder: (context, index) {
                                    final sale = sales[index];
                                    final custName = sale['customerName'] ?? '';
                                    String created = sale['saleDate'] ?? '';
                                    try {
                                      // Use day-first format (DD/MM/YYYY) with 24h time to match local expectation
                                      created = DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(created));
                                    } catch (_) {}
                                    final total = sale['price'] ?? sale['amount'] ?? 0;
                                    return Card(
                                      margin: const EdgeInsets.all(8),
                                      child: ListTile(
                                        title: Text(custName.isNotEmpty ? 'Cliente: $custName' : 'Cliente: —'),
                                        subtitle: Text('Total: R\$${total.toString()}'),
                                        trailing: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(created, style: TextStyle(fontSize: 12)),
                                            SizedBox(width: 8),
                                            IconButton(
                                              icon: Icon(Icons.edit, color: Colors.blue),
                                              onPressed: () => _editSale(sale['id'], sale),
                                            ),
                                            IconButton(
                                              icon: Icon(Icons.delete, color: Colors.red),
                                              onPressed: () => _deleteSale(sale['id']),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
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

  Future<void> _createSale() async {
    if (!_formKey.currentState!.validate()) return;
    final service = _serviceController.text.trim();
    final priceText = _priceController.text.trim();
    final customerName = _customerNameController.text.trim();
    final customerEmail = _customerEmailController.text.trim();
    double? price = double.tryParse(priceText.replaceAll(',', '.'));
    if (price == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Preço inválido')));
      return;
    }

    int? _toNullableInt(dynamic v) {
      if (v == null) return null;
      if (v is int) return v;
      final s = v.toString();
      return int.tryParse(s);
    }

    final Map<String, dynamic> payload = {
      'serviceName': service,
      'price': price,
    };
    if (customerName.isNotEmpty) payload['customerName'] = customerName;
    if (customerEmail.isNotEmpty) payload['customerEmail'] = customerEmail;
    if (_selectedChatCustomerLinkId != null && _chatCustomerIds.containsKey(_selectedChatCustomerLinkId)) {
      final v = _chatCustomerIds[_selectedChatCustomerLinkId];
      final parsed = _toNullableInt(v);
  if (parsed != null) payload['customerId'] = parsed;
    }

    try {
      setState(() => loading = true);
      final uri = Uri.parse('/sales');
      final resp = await http.post(uri, body: jsonEncode(payload), headers: {'Content-Type': 'application/json'});
      if (resp.statusCode == 201 || resp.statusCode == 200) {
        _serviceController.clear();
        _priceController.clear();
        _customerNameController.clear();
        _customerEmailController.clear();
        await fetchSales();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Venda criada')));
      } else {
        
        String userMsg = 'Falha ao criar venda';
        try {
          final parsed = jsonDecode(resp.body);
          if (parsed is Map && parsed.containsKey('message')) {
            userMsg = parsed['message'].toString();
          } else if (parsed is Map && parsed.containsKey('errors')) {
            userMsg = parsed['errors'].toString();
          } else if (parsed is Map && parsed.containsKey('detail')) {
            userMsg = parsed['detail'].toString();
          } else if (parsed is String) {
            userMsg = parsed;
          }
        } catch (_) {}
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(userMsg)));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao criar venda')));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _editSale(int id, Map<String, dynamic> currentData) async {
    final serviceController = TextEditingController(text: currentData['serviceName'] ?? '');
    final priceController = TextEditingController(text: currentData['price']?.toString() ?? '');
    final custNameController = TextEditingController(text: currentData['customerName'] ?? '');
    final custEmailController = TextEditingController(text: currentData['customerEmail'] ?? '');

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Editar Venda'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: serviceController,
                decoration: InputDecoration(labelText: 'Serviço'),
              ),
              TextField(
                controller: priceController,
                decoration: InputDecoration(labelText: 'Preço'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: custNameController,
                decoration: InputDecoration(labelText: 'Nome do Cliente'),
              ),
              TextField(
                controller: custEmailController,
                decoration: InputDecoration(labelText: 'Email do Cliente'),
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
        Uri.parse('/sales/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'serviceName': serviceController.text,
          'price': double.tryParse(priceController.text) ?? 0,
          'customerName': custNameController.text.isNotEmpty ? custNameController.text : null,
          'customerEmail': custEmailController.text.isNotEmpty ? custEmailController.text : null,
        }),
      );

      if (response.statusCode == 200) {
        await fetchSales();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Venda atualizada com sucesso!')),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Falha ao atualizar venda.')),
        );
      }
    }
  }

  Future<void> _deleteSale(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Excluir Venda'),
        content: Text('Tem certeza que deseja excluir esta venda?'),
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
      final response = await http.delete(Uri.parse('/sales/$id'));
      if (response.statusCode == 200) {
        await fetchSales();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Venda excluída com sucesso!')),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Falha ao excluir venda.')),
        );
      }
    }
  }
}
