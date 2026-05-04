import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme/index.js';

export function HorizontalBarChart({ data = [], color = colors.primary, valueFormatter = (value) => value }) {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);

  return (
    <View style={styles.wrap}>
      {data.map((item) => {
        const width = `${Math.max(3, (Number(item.value || 0) / max) * 100)}%`;

        return (
          <View key={item.label} style={styles.row}>
            <View style={styles.labelWrap}>
              <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.value}>{valueFormatter(item.value)}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width, backgroundColor: item.color || color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing[3],
  },
  row: {
    gap: 7,
  },
  labelWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    flex: 1,
  },
  value: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.panelAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
