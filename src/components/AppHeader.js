import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COMPANY } from '../constants/index.js';
import { colors, spacing } from '../theme/index.js';

export function AppHeader({ routeLabel, currentUser, compact = false, children, onLogout, team }) {
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
        {currentUser ? <Text style={styles.user}>{currentUser.name} | {currentUser.role.replace('_', ' ')}{team?.name ? ` | ${team.name}` : ''}</Text> : null}
      </View>
      <View style={styles.right}>
        {children}
        {currentUser && compact ? (
          <View style={styles.userPill}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userRole}>{currentUser.role.replace('_', ' ')}</Text>
          </View>
        ) : null}
        {onLogout ? (
          <TouchableOpacity style={styles.logout} onPress={onLogout} activeOpacity={0.82}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 74,
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
    minHeight: 62,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
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
    fontSize: 18,
    fontWeight: '800',
  },
  user: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  right: {
    maxWidth: 520,
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  userPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.panelAlt,
    paddingHorizontal: spacing[3],
    paddingVertical: 7,
    alignItems: 'flex-end',
  },
  userName: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  userRole: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 1,
  },
  logout: {
    minHeight: 34,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing[3],
    justifyContent: 'center',
    backgroundColor: colors.panel,
  },
  logoutText: {
    color: colors.brandRed,
    fontSize: 12,
    fontWeight: '800',
  },
});
