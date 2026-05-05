import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/index.js';

export function EmptyState({ title, body }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    minHeight: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  title: {
    color: COLORS.ink,
    fontWeight: '900',
    fontSize: 15,
  },
  body: {
    color: COLORS.muted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
