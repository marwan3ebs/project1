import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const tones = {
  success: ['#f0fdf4', '#bbf7d0', '#166534'],
  danger: ['#fef2f2', '#fecaca', '#b91c1c'],
  warning: ['#fff7ed', '#fed7aa', '#b45309'],
  info: ['#eff6ff', '#bfdbfe', '#1d4ed8'],
  muted: ['#f8fafc', '#d8e0ea', '#475569'],
  primary: ['#eef2f7', '#cbd5e1', '#17233a'],
};

export function StatusBadge({ label, tone = 'muted' }) {
  const [backgroundColor, borderColor, color] = tones[tone] || tones.muted;

  return (
    <View style={[styles.badge, { backgroundColor, borderColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
