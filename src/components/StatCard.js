import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/index.js';
import { useResponsive } from '../hooks/useResponsive.js';

export function StatCard({ label, value, detail, tone = 'teal' }) {
  const responsive = useResponsive();
  return (
    <View style={[styles.card, responsive.isMobile && styles.mobileCard, styles[tone]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 150,
    minWidth: 146,
    maxWidth: '100%',
    minHeight: 92,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  mobileCard: {
    flexBasis: '100%',
    minWidth: '100%',
  },
  teal: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe4ef',
  },
  amber: {
    backgroundColor: '#fffaf0',
    borderColor: '#f7d38a',
  },
  rose: {
    backgroundColor: '#fff5f5',
    borderColor: '#f5b8bf',
  },
  slate: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  value: {
    color: COLORS.ink,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
  },
  detail: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 8,
  },
});
