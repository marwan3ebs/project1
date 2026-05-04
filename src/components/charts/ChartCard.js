import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme/index.js';

export function ChartCard({ title, subtitle, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 260,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  header: {
    marginBottom: spacing[3],
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
});
