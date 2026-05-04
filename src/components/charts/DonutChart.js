import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme/index.js';

export function DonutChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;

  return (
    <View style={styles.wrap}>
      <View style={styles.donut}>
        <Text style={styles.total}>{total}</Text>
        <Text style={styles.totalLabel}>total</Text>
      </View>
      <View style={styles.legend}>
        {data.map((item) => {
          const pct = Math.round((Number(item.value || 0) / total) * 100);
          return (
            <View key={item.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: item.color || colors.primary }]} />
              <Text style={styles.legendText}>{item.label}</Text>
              <Text style={styles.legendValue}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  donut: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 18,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },
  total: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  legend: {
    flex: 1,
    gap: spacing[2],
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  legendValue: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
});
