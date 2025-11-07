import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

Widget buildChart(Map<String, dynamic> chartData) {
  final chartType = chartData['chartType'];
  final labels = chartData['labels'] as List<dynamic>;
  final datasets = chartData['datasets'] as List<dynamic>;

  switch (chartType) {
    case 'line':
      return LineChart(
        LineChartData(
          lineBarsData: datasets.map<LineChartBarData>((dataset) {
            return LineChartBarData(
              spots: List.generate(
                labels.length,
                (i) => FlSpot(i.toDouble(), (dataset['data'][i] as num).toDouble()),
              ),
              isCurved: true,
              color: Colors.blue,
            );
          }).toList(),
          titlesData: FlTitlesData(
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  final index = value.toInt();
                  if (index >= 0 && index < labels.length) {
                    final label = labels[index].toString();
                    if (label.contains('-')) {
                      final parts = label.split('-');
                      if (parts.length == 3) {
                        return Text('${parts[2]}/${parts[1]}', style: TextStyle(fontSize: 10));
                      }
                    }
                    return Text(label, style: TextStyle(fontSize: 10));
                  }
                  return Text('');
                },
                reservedSize: 30,
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(showTitles: true, reservedSize: 40),
            ),
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
        ),
      );

    case 'bar':
      return BarChart(
        BarChartData(
          barGroups: List.generate(labels.length, (i) {
            return BarChartGroupData(
              x: i,
              barRods: datasets.map((dataset) {
                return BarChartRodData(
                  toY: (dataset['data'][i] as num).toDouble(),
                  color: Colors.blue,
                  width: 15,
                );
              }).toList(),
            );
          }),
          titlesData: FlTitlesData(
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  final index = value.toInt();
                  if (index >= 0 && index < labels.length) {
                    final label = labels[index].toString();
                    if (label.contains('-')) {
                      final parts = label.split('-');
                      if (parts.length == 3) {
                        final meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                        final mes = int.tryParse(parts[1]);
                        if (mes != null && mes >= 1 && mes <= 12) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(meses[mes], style: TextStyle(fontSize: 10)),
                          );
                        }
                      }
                    }
                    return Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(label, style: TextStyle(fontSize: 10)),
                    );
                  }
                  return Text('');
                },
                reservedSize: 30,
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(showTitles: true, reservedSize: 40),
            ),
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
        ),
      );

    case 'pie':
      return PieChart(
        PieChartData(
          sections: datasets.expand((dataset) {
            return List.generate(dataset['data'].length, (i) {
              return PieChartSectionData(
                value: (dataset['data'][i] as num).toDouble(),
                title: dataset['label'],
              );
            });
          }).toList(),
        ),
      );

    default:
      return Center(child: Text('Gráfico do tipo $chartType não suportado'));
  }
}