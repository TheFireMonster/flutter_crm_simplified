import 'package:flutter/material.dart';
import 'package:flutter_crm/widgets/menu/side_menu.dart';
import 'package:table_calendar/table_calendar.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  int? _selectedSlot; // slot index (0..n) where each slot = 30 minutes
  final TextEditingController _nameController = TextEditingController();
  // use discrete duration selector (minutes)
  int _selectedDuration = 30;
  List<Map<String, dynamic>> _customers = [];
  Map<String, dynamic>? _selectedCustomer;
  Map<int, String> _slotStatus = {};

  @override
  void initState() {
    super.initState();
    fetchCustomers();
    _loadChatCustomers();
  }

  Future<void> fetchCustomers() async {
    final uri = Uri.parse('/customers');
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      if (!mounted) return;
      setState(() {
        _customers = data.map<Map<String, dynamic>>((c) => Map<String, dynamic>.from(c)).toList();
      });
      // merge any chat-created customers persisted locally
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
    // helper called after fetching server customers to ensure locally persisted chat customers are merged
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

  Future<void> fetchAppointments() async {
    if (_selectedDay == null) return;
    final dateStr = _selectedDay!.toIso8601String();
    final uri = Uri.parse('/appointments');
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      final todays = data
          .where((a) => a['appointmentDate'] != null && a['appointmentDate'].toString().startsWith(dateStr.substring(0, 10)))
          .map<Map<String, dynamic>>((a) => Map<String, dynamic>.from(a)).toList();
      if (!mounted) return;
      setState(() {
        _appointments = todays;
        _selectedSlot = null;
        _computeOccupiedSlots();
      });
    }
  }

  void _computeOccupiedSlots() {
    final status = <int, String>{};
    for (int i = 0; i < 20; i++) {
      status[i] = 'free';
    }

    for (final a in _appointments) {
      try {
        final apptDateStr = a['appointmentDate']?.toString();
        if (apptDateStr == null) continue;
        final dt = DateTime.parse(apptDateStr);
        final startMin = dt.hour * 60 + dt.minute;
        final dur = (a['duration'] is int)
            ? a['duration'] as int
            : (int.tryParse(RegExp(r"(\d+)").firstMatch(a['description']?.toString() ?? '')?.group(0) ?? '60') ?? 60);
        final endMin = startMin + dur;

        for (int slotIdx = 0; slotIdx < 20; slotIdx++) {
          final slotStart = 8 * 60 + slotIdx * 30;
          final slotEnd = slotStart + 30;
          // check overlap
          final overlap = !(endMin <= slotStart || startMin >= slotEnd);
          if (!overlap) continue;
          // if appointment fully covers the slot
          final fullyCovers = (startMin <= slotStart && endMin >= slotEnd);
          if (fullyCovers) {
            status[slotIdx] = 'full';
          } else {
            // only mark partial if not already full
            if (status[slotIdx] != 'full') status[slotIdx] = 'partial';
          }
        }
      } catch (_) {}
    }
    _slotStatus = status;
  }

  bool _canAdd() {
    if (_selectedDay == null) return false;
    if (_nameController.text.trim().isEmpty) return false;
    if (_selectedCustomer == null) return false;
    if (_selectedSlot == null) return false;
    // check duration fits in schedule
    final slotsNeeded = (_selectedDuration + 29) ~/ 30;
    if (_selectedSlot! + slotsNeeded > 20) return false;
    // check no overlap
    for (int s = 0; s < slotsNeeded; s++) {
      final idx = _selectedSlot! + s;
      if (_slotStatus[idx] != null && _slotStatus[idx] != 'free') return false;
    }
    return true;
  }

  Future<void> _confirmAndCreate() async {
    if (!_canAdd()) return;
    final slotMinutes = 8 * 60 + _selectedSlot! * 30;
    final start = '${(slotMinutes ~/ 60).toString().padLeft(2, '0')}:${(slotMinutes % 60).toString().padLeft(2, '0')}';
  final date = _selectedDay != null ? DateFormat('dd/MM/yyyy').format(_selectedDay!.toLocal()) : '-';
    final client = _selectedCustomer?['name'] ?? '-';

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Confirm appointment'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Date: $date'),
            SizedBox(height: 6),
            Text('Start: $start'),
            SizedBox(height: 6),
            Text('Duration: $_selectedDuration min'),
            SizedBox(height: 6),
            Text('Client: $client'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.of(ctx).pop(true), child: Text('Confirm')),
        ],
      ),
    );

    if (confirmed == true) {
      await createAppointment();
    }
  }

  Future<void> createAppointment() async {
    if (_selectedDay == null) return;
    final name = _nameController.text.trim();
    final duration = _selectedDuration;
    if (name.isEmpty || duration <= 0 || _selectedCustomer == null || _selectedSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please fill name, duration, client and select a start hour')),
      );
      return;
    }
  final durMin = duration; // duration is already int
    // check if any of the hours this appointment would occupy are already taken
    final slotsNeeded = (durMin + 29) ~/ 30;
    for (int s = 0; s < slotsNeeded; s++) {
      final slotIdx = _selectedSlot! + s;
      if (slotIdx < 0 || slotIdx >= 20 || (_slotStatus[slotIdx] != null && _slotStatus[slotIdx] != 'free')) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Selected time overlaps an existing appointment')),
        );
        return;
      }
    }
  // combine selected day with selected slot (30-minute increments)
    final slotMinutes = 8 * 60 + _selectedSlot! * 30;
    final apptDate = DateTime(_selectedDay!.year, _selectedDay!.month, _selectedDay!.day, slotMinutes ~/ 60, slotMinutes % 60);
    final uri = Uri.parse('/appointments');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'title': name,
        'description': 'Duration: $duration',
        'duration': duration,
        'appointmentDate': apptDate.toIso8601String(),
        'customerId': _selectedCustomer!['id'],
        'customerName': _selectedCustomer!['name'],
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      if (data is Map && data.containsKey('error')) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['error'] ?? 'Unknown error')),
        );
        return;
      }
  _nameController.clear();
      if (mounted) {
        setState(() {
          _selectedCustomer = null;
        });
      }
      await fetchAppointments();
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create appointment.')),
      );
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
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Select start hour', style: TextStyle(fontWeight: FontWeight.w600)),
                        SizedBox(height: 8),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: List.generate(20, (i) => i).map((slotIdx) {
                                  final slotHour = 8 + (slotIdx * 30) ~/ 60;
                                  final slotMin = (slotIdx * 30) % 60;
                                  final label = '${slotHour.toString().padLeft(2, '0')}:${slotMin.toString().padLeft(2, '0')}';
                                  final status = _slotStatus[slotIdx] ?? 'free';
                                  final selected = _selectedSlot == slotIdx;
                                  Color bg;
                                  switch (status) {
                                    case 'full':
                                      bg = Colors.red.shade300;
                                      break;
                                    case 'partial':
                                      bg = Colors.orange.shade200;
                                      break;
                                    default:
                                      bg = Colors.grey.shade200;
                                  }
                                  return Padding(
                                    padding: const EdgeInsets.only(right: 8.0),
                                    child: Material(
                                      elevation: selected ? 6 : 1,
                                      borderRadius: BorderRadius.circular(20),
                                      color: Colors.transparent,
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: selected ? Colors.blueAccent : bg,
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(color: selected ? Colors.blue.shade700 : Colors.grey.shade300),
                                        ),
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                        child: InkWell(
                                          borderRadius: BorderRadius.circular(20),
                                          onTap: () {
                                            if (status != 'free') return;
                                            setState(() {
                                              _selectedSlot = (_selectedSlot == slotIdx) ? null : slotIdx;
                                            });
                                          },
                                          child: Text(
                                            label,
                                            style: TextStyle(
                                              color: selected ? Colors.white : Colors.black87,
                                              fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _nameController,
                            decoration: InputDecoration(labelText: 'Appointment Name'),
                          ),
                        ),
                        SizedBox(width: 8),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: DropdownButton<int>(
                            value: _selectedDuration,
                            underline: SizedBox.shrink(),
                            items: [15, 30, 60].map((d) => DropdownMenuItem<int>(value: d, child: Text('$d min'))).toList(),
                            onChanged: (v) {
                              if (v == null) return;
                              setState(() {
                                _selectedDuration = v;
                              });
                            },
                          ),
                        ),
                        SizedBox(width: 8),
                        Expanded(
                          child: DropdownButton<Map<String, dynamic>>(
                            isExpanded: true,
                            value: _selectedCustomer,
                            hint: Text('Select Client'),
                            items: _customers.map((c) {
                              return DropdownMenuItem<Map<String, dynamic>>(
                                value: c,
                                child: Text(c['name'] ?? ''),
                              );
                            }).toList(),
                            onChanged: (val) {
                              setState(() {
                                _selectedCustomer = val;
                              });
                            },
                          ),
                        ),
                        SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              _selectedSlot != null
                                  ? 'Start: ${((8 + (_selectedSlot! * 30) ~/ 60)).toString().padLeft(2, '0')}:${((_selectedSlot! * 30) % 60).toString().padLeft(2, '0')}'
                                  : 'Start: -',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Text('Duration: $_selectedDuration min', style: Theme.of(context).textTheme.bodySmall),
                            SizedBox(height: 6),
                            ElevatedButton(
                              onPressed: _canAdd() ? _confirmAndCreate : null,
                              style: ElevatedButton.styleFrom(elevation: 4, padding: EdgeInsets.symmetric(horizontal: 18, vertical: 12)),
                              child: Text('Add'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: _appointments.length,
                      itemBuilder: (context, index) {
                        final appointment = _appointments[index];
                        String timeRange = '';
                        try {
                          final apptDateStr = appointment['appointmentDate']?.toString();
                          if (apptDateStr != null) {
                            final dt = DateTime.parse(apptDateStr);
                            final dur = (appointment['duration'] is int) ? appointment['duration'] as int : (int.tryParse(RegExp(r"(\d+)").firstMatch(appointment['description']?.toString() ?? '')?.group(0) ?? '60') ?? 60);
                            final end = dt.add(Duration(minutes: dur));
                            timeRange = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} - ${end.hour.toString().padLeft(2, '0')}:${end.minute.toString().padLeft(2, '0')}';
                          }
                        } catch (_) {}
                        final clientName = appointment['customerName'] ?? '';
                        final title = appointment['title'] ?? '';
                        final durDisplay = (appointment['duration'] is int) ? appointment['duration'].toString() : appointment['description']?.replaceAll('Duration: ', '') ?? '';
                        return Card(
                          elevation: 2,
                          margin: EdgeInsets.symmetric(vertical: 6),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: Colors.blueGrey.shade100,
                              child: Text(clientName.toString().isNotEmpty ? clientName.toString()[0].toUpperCase() : '?', style: TextStyle(color: Colors.black87)),
                            ),
                            title: Text(title, style: TextStyle(fontWeight: FontWeight.w600)),
                            subtitle: Text('Client: $clientName\nDuration: $durDisplay min', style: TextStyle(height: 1.3)),
                            trailing: Text(timeRange, style: TextStyle(fontSize: 12, color: Colors.black54)),
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