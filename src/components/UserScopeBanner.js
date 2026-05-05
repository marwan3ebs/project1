import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ROLE_LABELS, ROLES } from '../auth/index.js';
import { colors, spacing } from '../theme/index.js';

export function UserScopeBanner({ user, visibleCounts }) {
  const scope = user?.role === ROLES.MANAGER ? 'Company-wide access' : user?.role === ROLES.TEAM_LEADER ? 'Team-only access' : 'Own-records access';
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{scope}</Text>
      <Text style={styles.meta}>{user?.name} | {ROLE_LABELS[user?.role] || 'Role'} | {visibleCounts?.properties || 0} properties visible</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.primarySoft, borderColor: '#b8deda', borderWidth: 1, borderRadius: 8, padding: spacing[3], marginBottom: spacing[3] },
  title: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  meta: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 3 },
});
