import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COMPANY } from '../constants/index.js';
import { colors, spacing } from '../theme/index.js';

export function AppHeader({ routeLabel, currentUser, compact = false, children }) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      {!compact ? (
        <View style={styles.mark}>
          <Text style={styles.markText}>TA</Text>
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.company}>{COMPANY.legalName}</Text>
        <Text style={styles.name}>{routeLabel || COMPANY.appName}</Text>
        {currentUser ? <Text style={styles.user}>{currentUser.name} | {currentUser.role.replace('_', ' ')}</Text> : null}
      </View>
      {children ? <View style={styles.right}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCompact: {
    minHeight: 66,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.ink,
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
    color: colors.brandRed,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  user: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  right: {
    maxWidth: 480,
    flex: 1,
    alignItems: 'flex-end',
  },
});
