import React from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton.js';
import { spacing } from '../theme/index.js';

export function ActionMenu({ actions = [], compact = false }) {
  const visible = actions.filter(Boolean);
  if (!visible.length) return null;
  return (
    <View style={[styles.row, compact && styles.compact]}>
      {visible.map((action) => (
        <PrimaryButton key={action.key || action.label} label={action.label} tone={action.tone || 'muted'} onPress={action.onPress} disabled={action.disabled} size={compact ? 'sm' : 'md'} style={compact ? styles.compactButton : styles.button} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[3] },
  compact: { marginTop: 0 },
  button: { flexGrow: 0 },
  compactButton: { minWidth: 0 },
});
