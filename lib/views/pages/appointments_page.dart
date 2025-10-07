import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class AppointmentsPage extends StatefulWidget {
  const AppointmentsPage({super.key});

  @override
  State<AppointmentsPage> createState() => _AppointmentsPageState();
}

class _AppointmentsPageState extends State<AppointmentsPage> {
    bool isDrawerOpen = false;

  void toggleDrawer() {
    setState(() {
      isDrawerOpen = !isDrawerOpen;
    });
  }
  
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  List<Map<String, dynamic>> _appointments = [];
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _durationController = TextEditingController();

  Future<void> fetchAppointments() async {
    if (_selectedDay == null) return;
    final dateStr = _selectedDay!.toIso8601String();
    final resp = await Uri.parse('http://localhost:3000/appointments');
    final response = await http.get(resp);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      setState(() {
        _appointments = data
          .where((a) => a['appointmentDate'].toString().startsWith(dateStr.substring(0, 10)))
          .map<Map<String, dynamic>>((a) => Map<String, dynamic>.from(a)).toList();
      });
    }
  }

  Future<void> createAppointment() async {
    if (_selectedDay == null) return;
    final name = _nameController.text.trim();
    final duration = _durationController.text.trim();
    if (name.isEmpty || duration.isEmpty) return;
    final dateStr = _selectedDay!.toIso8601String();
    final resp = await Uri.parse('http://localhost:3000/appointments');
    final response = await http.post(
      resp,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'title': name,
        'description': 'Duration: $duration',
        'appointmentDate': dateStr,
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      _nameController.clear();
      _durationController.clear();
      fetchAppointments();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Appointments'), centerTitle: true),
      body: Row(
        children: [
          SideMenu(
            isDrawerOpen: false,
            toggleDrawer: () {},
          ),
          Expanded(
            child: Column(
              children: [
                TableCalendar(
                  firstDay: DateTime.utc(2020, 1, 1),
                  lastDay: DateTime.utc(2030, 12, 31),
                  focusedDay: _focusedDay,
                  selectedDayPredicate: (day) {
                    return isSameDay(_selectedDay, day);
                  },
                  onDaySelected: (selectedDay, focusedDay) {
                    setState(() {
                      _selectedDay = selectedDay;
                      _focusedDay = focusedDay;
                    });
                    fetchAppointments();
                  },
                  calendarStyle: CalendarStyle(
                    todayDecoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                    selectedDecoration: BoxDecoration(
                      color: Colors.orange,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                if (_selectedDay != null) ...[
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Text(
                      'Appointments for ${_selectedDay!.toLocal()}'.split(' ')[0],
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _nameController,
                            decoration: InputDecoration(labelText: 'Appointment Name'),
                          ),
                        ),
                        SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _durationController,
                            decoration: InputDecoration(labelText: 'Duration (min)'),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: createAppointment,
                          child: Text('Add'),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _appointments.length,
                      itemBuilder: (context, index) {
                        final appointment = _appointments[index];
                        return ListTile(
                          title: Text(appointment['title'] ?? ''),
                          subtitle: Text(appointment['description'] ?? ''),
                          trailing: Text(
                            appointment['appointmentDate'] != null
                              ? appointment['appointmentDate'].toString().substring(11, 16)
                              : '',
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}