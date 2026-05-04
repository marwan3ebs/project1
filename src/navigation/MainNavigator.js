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

import { AppHeader, BottomTabs, RoleSwitcher, SidebarNav, UserScopeBanner } from '../components/index.js';
import { DEFAULT_DEMO_USER_ID, PERMISSIONS, can, canCloseDeal, canViewProperty, filterDataByUserAccess } from '../auth/index.js';
import { colors, layout, spacing } from '../theme/index.js';
import { TABS } from '../constants/index.js';
import { useResponsive } from '../hooks/useResponsive.js';
import {
  addProperty,
  addTask,
  advancePropertyPhase,
  closePropertyDeal,
  getAgreementReminders,
  runPropertyAction,
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
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_DEMO_USER_ID);
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

  const currentUser = useMemo(
    () => (data.users || data.agents).find((user) => user.id === currentUserId) || (data.users || data.agents)[0],
    [data, currentUserId],
  );

  const visibleData = useMemo(
    () => filterDataByUserAccess(currentUser, data),
    [currentUser, data],
  );

  const visibleHelpers = useMemo(() => {
    const agentById = Object.fromEntries(visibleData.agents.map((agent) => [agent.id, agent]));
    const propertyById = Object.fromEntries(
      visibleData.properties.map((property) => [property.id, property]),
    );
    const teamById = Object.fromEntries(visibleData.teams.map((team) => [team.id, team]));

    return { agentById, propertyById, teamById };
  }, [visibleData]);

  const reminders = useMemo(() => getAgreementReminders(visibleData.properties, 30), [visibleData.properties]);
  const responsive = useResponsive();

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
      if (!can(currentUser, PERMISSIONS.CREATE_PROPERTY)) {
        setNotice('This role cannot create property agreements.');
        return;
      }
      updateData((current) => addProperty(current, form));
      navigate('inventory');
    },
    advancePhase: (propertyId) => {
      const property = data.properties.find((item) => item.id === propertyId);
      if (!can(currentUser, PERMISSIONS.ADVANCE_DEAL_PHASE, property)) {
        setNotice('This role cannot advance that deal phase.');
        return;
      }
      updateData((current) => advancePropertyPhase(current, propertyId));
    },
    closeDeal: (propertyId) => {
      const property = data.properties.find((item) => item.id === propertyId);
      if (!canCloseDeal(currentUser, property)) {
        setNotice('This role cannot close that deal.');
        return;
      }
      updateData((current) => closePropertyDeal(current, propertyId));
    },
    propertyAction: (propertyId, actionType, payload) => {
      const property = data.properties.find((item) => item.id === propertyId);
      if (!canViewProperty(currentUser, property)) {
        setNotice('This property is outside the current role scope.');
        return;
      }
      updateData((current) => runPropertyAction(current, propertyId, actionType, payload));
      setNotice('CRM action saved locally.');
    },
    addTask: (form) => {
      if (!can(currentUser, PERMISSIONS.CREATE_TASK)) {
        setNotice('This role cannot create tasks.');
        return;
      }
      updateData((current) => addTask(current, form));
    },
    toggleTask: (taskId) => {
      if (!can(currentUser, PERMISSIONS.COMPLETE_TASK)) {
        setNotice('This role cannot complete tasks.');
        return;
      }
      updateData((current) => toggleTaskStatus(current, taskId));
    },
    switchUser: (userId) => {
      setCurrentUserId(userId);
      navigate('home');
    },
    resetDemo: async () => {
      const performReset = async () => {
        const seed = await resetCrmData();
        setData(seed);
        setNotice('Demo data was reset successfully.');
        navigate('home');
      };

      if (Platform.OS === 'web') {
        await performReset();
        return;
      }

      Alert.alert('Reset demo data', 'Restore seed CRM data and clear local edits?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: performReset },
      ]);
    },
    seedDemo: async () => {
      const seed = await resetCrmData();
      setData(seed);
      setNotice('Fresh sample data loaded.');
    },
  };

  const screenProps = {
    data: visibleData,
    allData: data,
    helpers: visibleHelpers,
    allHelpers: helpers,
    reminders,
    actions,
    navigate,
    route,
    currentUser,
    responsive,
  };

  const tabName = TABS.some((tab) => tab.id === route.name) ? route.name : 'inventory';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={responsive.showSidebar ? styles.desktopShell : styles.mobileShell}>
        {responsive.showSidebar ? (
          <SidebarNav activeTab={tabName} onChange={setTab} currentUser={currentUser} />
        ) : null}
        <View style={styles.mainPane}>
        <AppHeader routeLabel={routeTitles[route.name]} currentUser={currentUser} compact={responsive.isDesktop}>
          {responsive.isDesktop ? (
            <RoleSwitcher users={data.users || data.agents} currentUser={currentUser} onChange={actions.switchUser} />
          ) : null}
        </AppHeader>
        {(notice || storageError) ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice || storageError}</Text>
          </View>
        ) : null}
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentInner,
            responsive.isDesktop && { width: '100%', maxWidth: responsive.contentMaxWidth, alignSelf: 'center', paddingHorizontal: spacing[6], paddingBottom: spacing[8] },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <UserScopeBanner user={currentUser} visibleCounts={{ properties: visibleData.properties.length }} />
          {route.name === 'home' ? <HomeScreen {...screenProps} /> : null}
          {route.name === 'inventory' ? <InventoryScreen {...screenProps} /> : null}
          {route.name === 'propertyDetail' ? <PropertyDetailScreen {...screenProps} /> : null}
          {route.name === 'addProperty' ? <AddPropertyScreen {...screenProps} /> : null}
          {route.name === 'schedule' ? <ScheduleScreen {...screenProps} /> : null}
          {route.name === 'reports' ? <ReportsScreen {...screenProps} /> : null}
          {route.name === 'team' ? <TeamScreen {...screenProps} /> : null}
          {route.name === 'settings' ? <SettingsScreen {...screenProps} /> : null}
        </ScrollView>
        {responsive.showBottomTabs ? <BottomTabs activeTab={tabName} onChange={setTab} /> : null}
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
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
    color: colors.warning,
    fontWeight: '800',
    fontSize: 12,
  },
  desktopShell: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileShell: {
    flex: 1,
  },
  mainPane: {
    flex: 1,
  },
});
