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
    flexBasis: 160,
    minWidth: 146,
    maxWidth: '100%',
    minHeight: 104,
    borderRadius: 8,
    borderWidth: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  mobileCard: {
    flexBasis: '100%',
    minWidth: '100%',
  },
  teal: {
    backgroundColor: '#ecfeff',
    borderColor: '#99f6e4',
  },
  amber: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  rose: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
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
    fontSize: 25,
    fontWeight: '900',
    marginTop: 8,
  },
  detail: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 8,
  },
});
