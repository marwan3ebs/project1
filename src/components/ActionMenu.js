import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PrimaryButton } from './PrimaryButton.js';
import { colors } from '../theme/index.js';
import { spacing } from '../theme/index.js';

export function ActionMenu({ actions = [], compact = false }) {
  const [open, setOpen] = useState(false);
  const visible = actions.filter(Boolean);
  if (!visible.length) return null;
  if (compact) {
    return (
      <View style={styles.compactWrap}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setOpen((value) => !value)} activeOpacity={0.82}>
          <Text style={styles.menuText}>Actions</Text>
        </TouchableOpacity>
        {open ? (
          <View style={styles.menuPanel}>
            {visible.map((action) => (
              <TouchableOpacity
                key={action.key || action.label}
                style={[styles.menuItem, action.disabled && styles.disabled]}
                disabled={action.disabled}
                onPress={() => {
                  setOpen(false);
                  action.onPress?.();
                }}
                activeOpacity={0.82}
              >
                <Text style={[styles.menuItemText, action.tone === 'danger' && styles.dangerText]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.row}>
      {visible.map((action) => (
        <PrimaryButton key={action.key || action.label} label={action.label} tone={action.tone || 'muted'} onPress={action.onPress} disabled={action.disabled} size={compact ? 'sm' : 'md'} style={compact ? styles.compactButton : styles.button} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[3] },
  button: { flexGrow: 0 },
  compactButton: { minWidth: 0 },
  compactWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  menuButton: {
    minHeight: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.panel,
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  menuPanel: {
    marginTop: 6,
    minWidth: 150,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 4,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    zIndex: 30,
  },
  menuItem: {
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  dangerText: {
    color: colors.danger,
  },
  disabled: {
    opacity: 0.45,
  },
});
