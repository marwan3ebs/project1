import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '../constants/index.js';

export function SectionHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.82}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
    marginBottom: 10,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  action: {
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfd3d6',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
