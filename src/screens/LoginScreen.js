import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DEMO_ACCOUNTS } from '../auth/index.js';
import { Card, FormInput, PrimaryButton, StatusBadge } from '../components/index.js';
import { COMPANY } from '../constants/index.js';
import { colors, shadows, spacing } from '../theme/index.js';

export function LoginScreen({ onLogin, error }) {
  const [email, setEmail] = useState('manager@remax-topagents.com');
  const [password, setPassword] = useState('manager123');

  return (
    <View style={styles.page}>
      <View style={styles.shell}>
        <View style={styles.brandPanel}>
          <View style={styles.logo}><Text style={styles.logoText}>TA</Text></View>
          <Text style={styles.brandEyebrow}>{COMPANY.legalName}</Text>
          <Text style={styles.title}>Top Agents Collaboration</Text>
          <Text style={styles.subtitle}>
            Secure local CRM workspace for inventory, agreements, team ownership, pipeline, and executive reporting.
          </Text>
          <View style={styles.identityGrid}>
            <Info label="Inventory" value="Primary and resale" />
            <Info label="Coverage" value="Managers, leaders, agents" />
            <Info label="Mode" value="Expo local demo" />
          </View>
        </View>

        <Card style={styles.loginCard}>
          <Text style={styles.formTitle}>Sign in</Text>
          <Text style={styles.formMeta}>Access is based on your demo account role and team assignment.</Text>
          <FormInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <FormInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Login to CRM" tone="accent" onPress={() => onLogin(email, password)} />
          <View style={styles.divider} />
          <Text style={styles.helpTitle}>Demo accounts</Text>
          {DEMO_ACCOUNTS.map((account) => (
            <View key={account.email} style={styles.accountRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountEmail}>{account.email}</Text>
                <Text style={styles.accountMeta}>{account.password} | {account.access}</Text>
              </View>
              <StatusBadge label={account.label} tone="primary" />
            </View>
          ))}
        </Card>
      </View>
    </View>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  shell: {
    width: '100%',
    maxWidth: 1040,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[5],
    alignItems: 'stretch',
  },
  brandPanel: {
    flex: 1.2,
    minWidth: 300,
    borderRadius: 10,
    backgroundColor: colors.navy,
    padding: spacing[8],
    justifyContent: 'center',
    ...shadows.raised,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.brandRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  logoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  brandEyebrow: {
    color: '#fecdd3',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: spacing[2],
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
    marginTop: spacing[3],
    maxWidth: 520,
  },
  identityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  info: {
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: spacing[3],
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },
  loginCard: {
    flex: 0.9,
    minWidth: 320,
    marginBottom: 0,
    padding: spacing[5],
  },
  formTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  formMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    marginBottom: spacing[4],
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[4],
  },
  helpTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: spacing[2],
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accountEmail: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  accountMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
});
