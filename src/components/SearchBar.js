import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { COLORS } from '../constants/index.js';

export function SearchBar({ value, onChangeText, placeholder = 'Search inventory' }) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
  },
  input: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 13,
    color: COLORS.ink,
    backgroundColor: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
