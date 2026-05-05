import React from 'react';
import { StyleSheet, View } from 'react-native';

import { COLORS } from '../constants/index.js';

export function ProgressBar({ value, color = COLORS.primary }) {
  const width = `${Math.max(0, Math.min(100, Number(value || 0)))}%`;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
