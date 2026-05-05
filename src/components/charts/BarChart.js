import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme/index.js';

export function BarChart({ data = [], color = colors.primary, valueFormatter = (value) => value }) {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  return (
    <View style={styles.wrap}>
      {data.map((item) => {
        const height = `${Math.max(4, (Number(item.value || 0) / max) * 100)}%`;

        return (
          <View key={item.label} style={styles.item}>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height, backgroundColor: item.color || color }]} />
            </View>
            <Text style={styles.value}>{valueFormatter(item.value)}</Text>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 190,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  item: {
    flex: 1,
    alignItems: 'center',
    minWidth: 42,
  },
  barTrack: {
    width: '70%',
    height: 120,
    borderRadius: 6,
    backgroundColor: colors.panelAlt,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  value: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 6,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'center',
  },
});
