import { StyleSheet } from 'react-native';

import { COLORS } from '../constants/index.js';

export const ui = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dce6e9',
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },
});
