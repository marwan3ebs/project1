import React from 'react';
import { Text, View } from 'react-native';

import { Card, PrimaryButton, SectionHeader, StatusBadge } from '../components/index.js';
import { DEMO_ACCOUNTS, ROLE_LABELS, ROLE_PERMISSIONS } from '../auth/index.js';
import { COMPANY } from '../constants/index.js';
import { screen } from './screenStyles.js';

export function SettingsScreen({ data, allData, actions, currentUser }) {
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
        <Text style={screen.title}>Signed-in access</Text>
        <Text style={screen.body}>
          Role scope is controlled by the demo login session. Logout and sign in with another account to test a different RBAC scope.
        </Text>
        <View style={screen.divider} />
        <Text style={screen.meta}>Active role: {ROLE_LABELS[currentUser?.role] || currentUser?.role}</Text>
        <Text style={screen.body}>{(ROLE_PERMISSIONS[currentUser?.role] || []).join(', ')}</Text>
      </Card>

      <Card>
        <Text style={screen.title}>Demo login accounts</Text>
        <Text style={screen.body}>
          These accounts are local demo credentials only. They are meant for testing manager, team leader, and agent visibility without a backend.
        </Text>
        {DEMO_ACCOUNTS.map((account) => (
          <View key={account.email} style={[screen.rowBetween, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={screen.infoValue}>{account.label}</Text>
              <Text style={screen.meta}>{account.email}</Text>
              <Text style={screen.meta}>Password: {account.password}</Text>
            </View>
            <StatusBadge label={account.scopeLabel} tone="primary" />
          </View>
        ))}
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
