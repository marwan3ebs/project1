import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/index.js';

export function MetricTrend({ label, value, trend = 0 }) {
  const positive = Number(trend) >= 0;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={[styles.trend, positive ? styles.positive : styles.negative]}>
        {positive ? '+' : ''}{trend}% vs prior window
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minWidth: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    padding: 12,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  trend: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
});
