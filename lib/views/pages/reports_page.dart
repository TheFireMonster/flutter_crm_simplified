import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
// fl_chart and go_router unused in this page
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../widgets/charts/chartscreen.dart';

class ReportsPage extends StatefulWidget {
  const ReportsPage({super.key});

  @override
  State<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends State<ReportsPage> {
  final TextEditingController _controller = TextEditingController();
  String get chartPrompt => _controller.text;
  bool isDrawerOpen = false;

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }

  Map<String, dynamic>? _chartResult;
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> generateChart(String prompt) async {
    final uri = Uri.parse('/chartai/generate');
    _isLoading = true;
    _errorMessage = null;
    setState(() {});
    try {
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'prompt': prompt}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        _errorMessage = 'Server returned ${response.statusCode}';
        _chartResult = null;
        return;
      }

  final data = jsonDecode(response.body);

      // If ChartAI already returned labels/datasets, use directly
      if (data is Map && data.containsKey('labels') && data.containsKey('datasets')) {
        _chartResult = Map<String, dynamic>.from(data);
        return;
      }

      // If ChartAI returned { chartType, chartData }
      final chartType = data['chartType'] ?? 'line';
      final chartData = data['chartData'];

      List<String> labels = [];
      List<Map<String, dynamic>> datasets = [];

      if (chartData is List && chartData.isNotEmpty) {
        final firstItem = chartData[0];

        if (firstItem is Map<String, dynamic>) {
          // Determine label key heuristically
          String labelKey = 'label';
          for (final candidate in ['appointmentDate', 'date', 'label', 'name']) {
            if (firstItem.containsKey(candidate)) {
              labelKey = candidate;
              break;
            }
          }

          labels = chartData.map<String>((row) => (row[labelKey] ?? '').toString()).toList();

          // For every numeric key (excluding the labelKey) create a dataset
          final numericKeys = <String>[];
          firstItem.forEach((k, v) {
            if (k == labelKey) return;
            if (v is num) numericKeys.add(k);
          });

          // If numericKeys empty, try to detect numeric columns by inspecting all values
          if (numericKeys.isEmpty) {
            firstItem.forEach((k, v) {
              if (k == labelKey) return;
              final allNumeric = chartData.every((row) {
                final val = (row is Map && row.containsKey(k)) ? row[k] : null;
                return val is num || (val is String && num.tryParse(val) != null);
              });
              if (allNumeric) numericKeys.add(k);
            });
          }

          for (final key in numericKeys) {
            final dataList = chartData.map((r) {
              if (r is Map && r.containsKey(key)) {
                final v = r[key];
                if (v is num) return v.toDouble();
                final parsed = num.tryParse(v?.toString() ?? '0');
                return parsed != null ? parsed.toDouble() : 0.0;
              }
              return 0.0;
            }).toList();
            datasets.add({'label': key, 'data': dataList});
          }
        } else if (firstItem is List) {
          // chartData is a list of lists: infer labels as indices
          labels = List.generate(chartData.length, (i) => 'Item $i');
          datasets.add({'label': 'series', 'data': chartData.map((r) => (r is num ? r.toDouble() : 0.0)).toList()});
        }
      }

      _chartResult = {
        'chartType': chartType,
        'labels': labels,
        'datasets': datasets,
        'raw': data,
      };
    } catch (e) {
      _errorMessage = e.toString();
      _chartResult = null;
    } finally {
      _isLoading = false;
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Reports Page')),
      body: Row(
        children: [
          SideMenu(isDrawerOpen: isDrawerOpen, toggleDrawer: toggleDrawer),
          Expanded(
            child: Container(
              color: Colors.grey[200],
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      labelText: 'Type your message here',
                      labelStyle: TextStyle(color: Colors.black54),
                      floatingLabelStyle: TextStyle(color: Colors.black54),
                      border: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.grey),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.grey),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    onSubmitted: (_) => generateChart(chartPrompt),
                  ),
                  SizedBox(height: 16),
                  if (_isLoading) ...[
                    Center(child: CircularProgressIndicator()),
                  ] else if (_errorMessage != null) ...[
                    Container(
                      color: Colors.red[100],
                      padding: EdgeInsets.all(12),
                      child: Text('Error: $_errorMessage', style: TextStyle(color: Colors.red[800])),
                    ),
                  ] else ...[
                    Expanded(
                      child: _chartResult != null
                          ? buildChart(_chartResult!)
                          : Center(child: Text('No chart yet. Type a prompt and press Enter.')),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
