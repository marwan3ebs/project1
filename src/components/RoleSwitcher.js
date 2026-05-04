import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DEMO_USERS, ROLE_LABELS } from '../auth/index.js';
import { colors, spacing } from '../theme/index.js';

export function RoleSwitcher({ users = [], currentUser, onChange }) {
  return (
    <View style={styles.shell}>
      <Text style={styles.label}>Current scope</Text>
      <View style={styles.row}>
        {DEMO_USERS.map((demo) => {
          const user = users.find((item) => item.id === demo.id);
          const active = currentUser?.id === demo.id;
          return (
            <TouchableOpacity key={demo.id} style={[styles.option, active && styles.optionActive]} onPress={() => onChange(demo.id)} activeOpacity={0.82}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{ROLE_LABELS[user?.role] || demo.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {currentUser ? <Text style={styles.meta}>{currentUser.name} | {ROLE_LABELS[currentUser.role]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { gap: spacing[2] },
  label: { color: colors.muted, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  option: { minHeight: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel, paddingHorizontal: spacing[3], alignItems: 'center', justifyContent: 'center' },
  optionActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  optionText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  optionTextActive: { color: '#ffffff' },
  meta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
});
