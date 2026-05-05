import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { COLORS, TABS } from '../constants/index.js';
import { TabButton } from './TabButton.js';

export function BottomTabs({ activeTab, onChange }) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.inner}
      >
        {TABS.map((tab) => (
          <View key={tab.id} style={styles.tabSlot}>
            <TabButton
              label={tab.label}
              active={activeTab === tab.id}
              onPress={() => onChange(tab.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 74,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inner: {
    paddingHorizontal: 8,
    gap: 6,
  },
  tabSlot: {
    width: 72,
  },
});
