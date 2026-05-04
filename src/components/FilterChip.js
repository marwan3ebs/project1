import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { COLORS } from '../constants/index.js';

export function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.active]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  active: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  text: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeText: {
    color: '#ffffff',
  },
});
