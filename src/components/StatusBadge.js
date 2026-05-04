import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const tones = {
  success: ['#dcfce7', '#86efac', '#166534'],
  danger: ['#ffe4e6', '#fda4af', '#be123c'],
  warning: ['#ffedd5', '#fdba74', '#9a3412'],
  info: ['#dbeafe', '#93c5fd', '#1d4ed8'],
  muted: ['#f8fafc', '#cbd5e1', '#334155'],
  primary: ['#ccfbf1', '#5eead4', '#0f766e'],
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
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '900',
  },
});
