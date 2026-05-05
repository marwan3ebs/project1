import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TABS } from '../constants/index.js';
import { colors, layout, spacing } from '../theme/index.js';

export function SidebarNav({ activeTab, onChange, currentUser, onLogout }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.mark}><Text style={styles.markText}>TA</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandTitle}>RE/MAX Top Agents</Text>
          <Text style={styles.brandMeta}>{currentUser?.name || 'Demo user'}</Text>
        </View>
      </View>
      <View style={styles.nav}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity key={tab.id} style={[styles.item, active && styles.itemActive]} onPress={() => onChange(tab.id)} activeOpacity={0.82}>
              <Text style={[styles.itemText, active && styles.itemTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Signed in</Text>
        <Text style={styles.footerName}>{currentUser?.name}</Text>
        <Text style={styles.footerRole}>{currentUser?.role?.replace('_', ' ')}</Text>
        <TouchableOpacity style={styles.logout} onPress={onLogout} activeOpacity={0.82}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { width: layout.desktopSidebarWidth, backgroundColor: colors.navy, padding: spacing[4], borderRightWidth: 1, borderRightColor: '#1f2a3d' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[6] },
  mark: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.brandRed, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#ffffff', fontWeight: '900' },
  brandTitle: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  brandMeta: { color: '#cbd5e1', fontSize: 11, fontWeight: '700', marginTop: 3 },
  nav: { gap: spacing[1], flex: 1 },
  item: { minHeight: 38, borderRadius: 8, paddingHorizontal: spacing[3], justifyContent: 'center' },
  itemActive: { backgroundColor: '#ffffff' },
  itemText: { color: '#cbd5e1', fontSize: 13, fontWeight: '900' },
  itemTextActive: { color: colors.ink },
  footer: { borderTopWidth: 1, borderTopColor: '#263449', paddingTop: spacing[4], gap: 3 },
  footerLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  footerName: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  footerRole: { color: '#cbd5e1', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  logout: { minHeight: 34, borderRadius: 7, borderWidth: 1, borderColor: '#40516b', alignItems: 'center', justifyContent: 'center', marginTop: spacing[3] },
  logoutText: { color: '#fecdd3', fontSize: 12, fontWeight: '900' },
});
