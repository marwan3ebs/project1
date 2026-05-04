import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { COLORS } from '../constants/index.js';

export function PrimaryButton({ label, onPress, tone = 'primary', disabled = false, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[tone], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
    >
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  dark: {
    backgroundColor: COLORS.ink,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  muted: {
    backgroundColor: '#64748b',
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
