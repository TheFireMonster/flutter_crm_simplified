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