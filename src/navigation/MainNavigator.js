import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppHeader, BottomTabs } from '../components/index.js';
import { COLORS, TABS } from '../constants/index.js';
import {
  addProperty,
  addTask,
  advancePropertyPhase,
  closePropertyDeal,
  getAgreementReminders,
  toggleTaskStatus,
} from '../services/crmService.js';
import { loadCrmData, resetCrmData, saveCrmData } from '../services/storageService.js';
import { createSeedData } from '../data/sampleData.js';
import { HomeScreen } from '../screens/HomeScreen.js';
import { InventoryScreen } from '../screens/InventoryScreen.js';
import { PropertyDetailScreen } from '../screens/PropertyDetailScreen.js';
import { AddPropertyScreen } from '../screens/AddPropertyScreen.js';
import { ScheduleScreen } from '../screens/ScheduleScreen.js';
import { ReportsScreen } from '../screens/ReportsScreen.js';
import { TeamScreen } from '../screens/TeamScreen.js';
import { SettingsScreen } from '../screens/SettingsScreen.js';

const routeTitles = {
  home: 'Manager Dashboard',
  inventory: 'Inventory',
  propertyDetail: 'Property Details',
  addProperty: 'Add Agreement',
  schedule: 'Schedule',
  reports: 'Reports',
  team: 'Team Performance',
  settings: 'Settings',
};

export function MainNavigator() {
  const [data, setData] = useState(() => createSeedData());
  const [hydrated, setHydrated] = useState(false);
  const [route, setRoute] = useState({ name: 'home' });
  const [notice, setNotice] = useState(null);
  const [storageError, setStorageError] = useState(null);

  useEffect(() => {
    let mounted = true;

    loadCrmData().then((result) => {
      if (!mounted) {
        return;
      }

      setData(result.data);
      setHydrated(true);

      if (result.error) {
        setNotice(result.error);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveCrmData(data).then((result) => {
      setStorageError(result.error);
    });
  }, [data, hydrated]);

  const helpers = useMemo(() => {
    const agentById = Object.fromEntries(data.agents.map((agent) => [agent.id, agent]));
    const propertyById = Object.fromEntries(
      data.properties.map((property) => [property.id, property]),
    );
    const teamById = Object.fromEntries(data.teams.map((team) => [team.id, team]));

    return { agentById, propertyById, teamById };
  }, [data]);

  const reminders = useMemo(() => getAgreementReminders(data.properties, 30), [data.properties]);

  function navigate(name, params = {}) {
    setRoute({ name, params });
  }

  function setTab(tabId) {
    navigate(tabId);
  }

  function updateData(updater) {
    setData((current) => (typeof updater === 'function' ? updater(current) : updater));
  }

  const actions = {
    addProperty: (form) => {
      updateData((current) => addProperty(current, form));
      navigate('inventory');
    },
    advancePhase: (propertyId) => {
      updateData((current) => advancePropertyPhase(current, propertyId));
    },
    closeDeal: (propertyId) => {
      updateData((current) => closePropertyDeal(current, propertyId));
    },
    addTask: (form) => updateData((current) => addTask(current, form)),
    toggleTask: (taskId) => updateData((current) => toggleTaskStatus(current, taskId)),
    resetDemo: () => {
      Alert.alert('Reset demo data', 'Restore seed CRM data and clear local edits?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const seed = await resetCrmData();
            setData(seed);
            setNotice('Demo data was reset successfully.');
            navigate('home');
          },
        },
      ]);
    },
    seedDemo: async () => {
      const seed = await resetCrmData();
      setData(seed);
      setNotice('Fresh sample data loaded.');
    },
  };

  const screenProps = {
    data,
    helpers,
    reminders,
    actions,
    navigate,
    route,
  };

  const tabName = TABS.some((tab) => tab.id === route.name) ? route.name : 'inventory';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader routeLabel={routeTitles[route.name]} />
        {(notice || storageError) ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice || storageError}</Text>
          </View>
        ) : null}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          {route.name === 'home' ? <HomeScreen {...screenProps} /> : null}
          {route.name === 'inventory' ? <InventoryScreen {...screenProps} /> : null}
          {route.name === 'propertyDetail' ? <PropertyDetailScreen {...screenProps} /> : null}
          {route.name === 'addProperty' ? <AddPropertyScreen {...screenProps} /> : null}
          {route.name === 'schedule' ? <ScheduleScreen {...screenProps} /> : null}
          {route.name === 'reports' ? <ReportsScreen {...screenProps} /> : null}
          {route.name === 'team' ? <TeamScreen {...screenProps} /> : null}
          {route.name === 'settings' ? <SettingsScreen {...screenProps} /> : null}
        </ScrollView>
        <BottomTabs activeTab={tabName} onChange={setTab} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 96,
  },
  notice: {
    backgroundColor: '#fff7ed',
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  noticeText: {
    color: COLORS.warning,
    fontWeight: '800',
    fontSize: 12,
  },
});
