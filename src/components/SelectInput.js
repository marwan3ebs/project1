import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '../constants/index.js';

export function SelectInput({ label, options, value, onChange, error }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.options}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, active && styles.active]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.82}
            >
              <Text style={[styles.optionText, active && styles.activeText]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  active: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  activeText: {
    color: '#ffffff',
  },
  error: {
    color: COLORS.danger,
    marginTop: 5,
    fontSize: 12,
    fontWeight: '700',
  },
});
