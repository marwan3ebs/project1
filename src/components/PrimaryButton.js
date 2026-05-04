import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors } from '../theme/index.js';
import { useResponsive } from '../hooks/useResponsive.js';

export function PrimaryButton({ label, onPress, tone = 'primary', disabled = false, style, size = 'md' }) {
  const responsive = useResponsive();
  const compact = responsive.isDesktop || size === 'sm';
  return (
    <TouchableOpacity
      style={[styles.button, compact && styles.compact, styles[tone], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
    >
      <Text style={[styles.text, compact && styles.compactText]}>{label}</Text>
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
  compact: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  dark: {
    backgroundColor: colors.ink,
  },
  danger: {
    backgroundColor: colors.danger,
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
  compactText: {
    fontSize: 12,
  },
});
