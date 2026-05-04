import { StyleSheet } from 'react-native';

import { COLORS } from '../constants/index.js';

export const screen = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  body: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  infoBlock: {
    width: '47%',
    minHeight: 54,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionFlex: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
});

export function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label || value || 'Not set';
}
