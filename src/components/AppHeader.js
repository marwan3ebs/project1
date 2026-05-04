import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, COMPANY } from '../constants/index.js';

export function AppHeader({ routeLabel }) {
  return (
    <View style={styles.header}>
      <View style={styles.mark}>
        <Text style={styles.markText}>TA</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.company}>{COMPANY.legalName}</Text>
        <Text style={styles.name}>{routeLabel || COMPANY.appName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  copy: {
    flex: 1,
  },
  company: {
    color: COLORS.brandRed,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  name: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: '900',
  },
});
