import React from 'react';
import { Text, View } from 'react-native';

import { Card, PrimaryButton, SectionHeader, StatusBadge } from '../components/index.js';
import { COMPANY } from '../constants/index.js';
import { screen } from './screenStyles.js';

export function SettingsScreen({ data, actions }) {
  return (
    <View>
      <SectionHeader title="Demo settings" subtitle="Reset, seed, and explain the local CRM demo" />

      <Card>
        <View style={screen.rowBetween}>
          <View>
            <Text style={screen.title}>{COMPANY.appName}</Text>
            <Text style={screen.meta}>{COMPANY.version}</Text>
          </View>
          <StatusBadge label="Expo demo" tone="primary" />
        </View>
        <Text style={screen.body}>
          This version keeps the project in React Native / Expo and persists demo CRM data locally with AsyncStorage.
        </Text>
      </Card>

      <Card>
        <Text style={screen.title}>Demo data</Text>
        <View style={screen.detailGrid}>
          <Info label="Properties" value={data.properties.length} />
          <Info label="Agents" value={data.agents.length} />
          <Info label="Tasks" value={data.tasks.length} />
          <Info label="Deals" value={data.deals?.length || 0} />
        </View>
        <View style={screen.actionRow}>
          <PrimaryButton label="Seed sample data" onPress={actions.seedDemo} style={screen.actionFlex} />
          <PrimaryButton label="Reset demo" onPress={actions.resetDemo} tone="danger" style={screen.actionFlex} />
        </View>
      </Card>

      <Card>
        <Text style={screen.title}>Role demo</Text>
        <Text style={screen.body}>
          Manager: use Home and Reports. Team leader: use Team. Agents: use Inventory, Property Details, and Schedule.
        </Text>
      </Card>
    </View>
  );
}

function Info({ label, value }) {
  return (
    <View style={screen.infoBlock}>
      <Text style={screen.infoLabel}>{label}</Text>
      <Text style={screen.infoValue}>{value}</Text>
    </View>
  );
}
