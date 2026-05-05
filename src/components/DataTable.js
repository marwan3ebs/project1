import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing } from '../theme/index.js';

export function DataTable({ columns, rows, keyExtractor, renderActions }) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.header]}>
        {columns.map((column) => <Text key={column.key} style={[styles.headerText, { flex: column.flex || 1 }]}>{column.label}</Text>)}
        {renderActions ? <Text style={[styles.headerText, styles.actions]}>Actions</Text> : null}
      </View>
      {rows.map((row) => (
        <View key={keyExtractor(row)} style={styles.row}>
          {columns.map((column) => <Text key={column.key} style={[styles.cell, { flex: column.flex || 1 }]} numberOfLines={2}>{column.render ? column.render(row) : row[column.key]}</Text>)}
          {renderActions ? <View style={styles.actionsCell}>{renderActions(row)}</View> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', marginTop: spacing[3] },
  row: { minHeight: layout.tableRowHeight, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[3] },
  header: { minHeight: 38, backgroundColor: colors.panelAlt },
  headerText: { color: colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cell: { color: colors.text, fontSize: 12, fontWeight: '600' },
  actions: { width: 136 },
  actionsCell: { width: 136, alignItems: 'flex-end' },
});
