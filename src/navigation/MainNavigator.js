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

import { AppHeader, BottomTabs, SidebarNav } from '../components/index.js';
import {
  PERMISSIONS,
  can,
  canCloseDeal,
  canDeleteProperty,
  canEditProperty,
  canManageUser,
  canReassignProperty,
  canViewProperty,
  filterDataByUserAccess,
  getTeamIds,
  isManagerRole,
  login as authLogin,
  logout as authLogout,
  restoreSession,
} from '../auth/index.js';
import { colors, layout, spacing } from '../theme/index.js';
import { TABS } from '../constants/index.js';
import { useResponsive } from '../hooks/useResponsive.js';
import {
  addProperty,
  addTask,
  advancePropertyPhase,
  approveAgreement,
  closePropertyDeal,
  deleteProperty,
  getAgreementReminders,
  runPropertyAction,
  toggleTaskStatus,
  updateTask,
} from '../services/crmService.js';
import { AUDIT_ACTIONS, logAudit, logDenied } from '../services/auditService.js';
import { addAgent, deactivateAgent, deleteAgent, updateAgent } from '../services/teamService.js';
import { reassignPropertyOwnership, reassignTaskOwnership, transferAgentTeam } from '../services/ownershipService.js';
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
import { LoginScreen } from '../screens/LoginScreen.js';

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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [route, setRoute] = useState({ name: 'home' });
  const [notice, setNotice] = useState(null);
  const [storageError, setStorageError] = useState(null);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([loadCrmData(), restoreSession()]).then(([result, session]) => {
      if (!mounted) {
        return;
      }

      setData(result.data);
      if (session?.userId) {
        setCurrentUserId(session.userId);
      }
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
    () => (data.users || data.agents).find((user) => user.id === currentUserId) || null,
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

  function canAssignToAgent(agentId) {
    const agent = data.agents.find((item) => item.id === agentId);
    if (!agent || agent.status === 'inactive' || agent.isActive === false) {
      return false;
    }
    if (isManagerRole(currentUser?.role)) {
      return true;
    }
    if (currentUser?.role === 'team_leader') {
      return getTeamIds(currentUser).includes(agent.teamId);
    }
    return agent.id === currentUser?.id;
  }

  const actions = {
    addProperty: (form) => {
      if (!can(currentUser, PERMISSIONS.CREATE_PROPERTY)) {
        updateData((current) => logDenied(current, currentUser, 'create_property', 'property', form?.agreementCode, 'This role cannot create property agreements.'));
        setNotice('This role cannot create property agreements.');
        return;
      }
      if (!canAssignToAgent(form.agentId)) {
        updateData((current) => logDenied(current, currentUser, 'create_property', 'agent', form.agentId, 'Cannot create agreement for an agent outside your scope.'));
        setNotice('You cannot create an agreement for an agent outside your role scope.');
        return;
      }
      updateData((current) =>
        logAudit(addProperty(current, { ...form, createdBy: currentUser.id }), {
          action: 'property_created',
          user: currentUser,
          targetType: 'property',
          targetId: form.agreementCode || 'new',
          details: 'Property agreement created locally.',
        }),
      );
      navigate('inventory');
    },
    advancePhase: (propertyId) => {
      const property = data.properties.find((item) => item.id === propertyId);
      if (!can(currentUser, PERMISSIONS.ADVANCE_DEAL_PHASE, property, { teams: data.teams })) {
        updateData((current) => logDenied(current, currentUser, 'advance_phase', 'property', propertyId, 'Cannot advance deal outside role scope.'));
        setNotice('This role cannot advance that deal phase.');
        return;
      }
      updateData((current) =>
        logAudit(advancePropertyPhase(current, propertyId), {
          action: 'deal_phase_advanced',
          user: currentUser,
          targetType: 'property',
          targetId: propertyId,
          details: 'Deal moved forward one phase.',
        }),
      );
    },
    closeDeal: (propertyId) => {
      const property = data.properties.find((item) => item.id === propertyId);
      if (!canCloseDeal(currentUser, property, data.teams)) {
        updateData((current) => logDenied(current, currentUser, 'deal_closed', 'property', propertyId, 'Cannot close deal outside role scope.'));
        setNotice('This role cannot close that deal.');
        return;
      }
      updateData((current) =>
        logAudit(closePropertyDeal(current, propertyId), {
          action: AUDIT_ACTIONS.DEAL_CLOSED,
          user: currentUser,
          targetType: 'property',
          targetId: propertyId,
          details: 'Deal marked closed.',
        }),
      );
    },
    propertyAction: (propertyId, actionType, payload) => {
      const property = data.properties.find((item) => item.id === propertyId);
      if (!canViewProperty(currentUser, property)) {
        updateData((current) => logDenied(current, currentUser, actionType, 'property', propertyId, 'Property outside current scope.'));
        setNotice('This property is outside the current role scope.');
        return;
      }
      if (['delete_property'].includes(actionType) && !canDeleteProperty(currentUser, property, data.teams)) {
        updateData((current) => logDenied(current, currentUser, actionType, 'property', propertyId, 'Delete property is manager/admin only.'));
        setNotice('Only manager/admin can delete a property.');
        return;
      }
      if (!['follow_up', 'meeting', 'buyer_preview', 'contract_check'].includes(actionType) && !canEditProperty(currentUser, property, data.teams)) {
        updateData((current) => logDenied(current, currentUser, actionType, 'property', propertyId, 'Cannot edit property outside role scope.'));
        setNotice('This role cannot edit that property.');
        return;
      }
      updateData((current) => {
        const next = actionType === 'delete_property'
          ? deleteProperty(current, propertyId)
          : runPropertyAction(current, propertyId, actionType, { ...payload, currentUser });
        return logAudit(next, {
          action: actionType === 'commission_received' ? AUDIT_ACTIONS.COMMISSION_RECORDED : actionType,
          user: currentUser,
          targetType: 'property',
          targetId: propertyId,
          details: 'CRM action saved locally.',
        });
      });
      setNotice('CRM action saved locally.');
    },
    addTask: (form) => {
      if (!can(currentUser, PERMISSIONS.CREATE_TASK)) {
        updateData((current) => logDenied(current, currentUser, 'task_created', 'task', form?.title, 'This role cannot create tasks.'));
        setNotice('This role cannot create tasks.');
        return;
      }
      if (!canAssignToAgent(form.agentId || form.assignedAgentId)) {
        updateData((current) => logDenied(current, currentUser, 'task_created', 'agent', form.agentId, 'Cannot assign task outside role scope.'));
        setNotice('You cannot assign a task outside your role scope.');
        return;
      }
      updateData((current) =>
        logAudit(addTask(current, { ...form, createdBy: currentUser.id }), {
          action: 'task_created',
          user: currentUser,
          targetType: 'task',
          targetId: form.title,
          details: 'Task created locally.',
        }),
      );
    },
    toggleTask: (taskId) => {
      const task = data.tasks.find((item) => item.id === taskId);
      if (!can(currentUser, PERMISSIONS.COMPLETE_TASK, task, { teams: data.teams })) {
        updateData((current) => logDenied(current, currentUser, 'task_completed', 'task', taskId, 'Cannot complete task outside role scope.'));
        setNotice('This role cannot complete tasks.');
        return;
      }
      updateData((current) =>
        logAudit(toggleTaskStatus(current, taskId), {
          action: task?.status === 'done' ? 'task_reopened' : 'task_completed',
          user: currentUser,
          targetType: 'task',
          targetId: taskId,
          details: 'Task status changed.',
        }),
      );
    },
    updateTask: (taskId, patch) => {
      const task = data.tasks.find((item) => item.id === taskId);
      if (!can(currentUser, PERMISSIONS.EDIT_TASK, task, { teams: data.teams })) {
        updateData((current) => logDenied(current, currentUser, 'task_updated', 'task', taskId, 'Cannot edit task outside role scope.'));
        setNotice('This role cannot edit that task.');
        return;
      }
      updateData((current) =>
        logAudit(updateTask(current, taskId, patch), {
          action: 'task_updated',
          user: currentUser,
          targetType: 'task',
          targetId: taskId,
          details: 'Task updated locally.',
        }),
      );
    },
    approveAgreement: (agreementId) => {
      const agreement = data.agreements.find((item) => item.id === agreementId);
      if (!can(currentUser, PERMISSIONS.APPROVE_AGREEMENT, agreement, { teams: data.teams })) {
        updateData((current) => logDenied(current, currentUser, 'agreement_approved', 'agreement', agreementId, 'Only manager/admin can approve agreements.'));
        setNotice('Only manager/admin can approve or override agreements.');
        return;
      }
      updateData((current) =>
        logAudit(approveAgreement(current, agreementId, currentUser), {
          action: AUDIT_ACTIONS.AGREEMENT_APPROVED,
          user: currentUser,
          targetType: 'agreement',
          targetId: agreementId,
          details: 'Agreement approved by manager/admin.',
        }),
      );
    },
    addAgent: (form) => {
      if (!canManageUser(currentUser)) {
        updateData((current) => logDenied(current, currentUser, 'agent_created', 'agent', form?.email, 'Only manager/admin can add agents.'));
        setNotice('Only manager/admin can add agents.');
        return;
      }
      updateData((current) => addAgent(current, currentUser, form));
      setNotice('Agent added locally.');
    },
    updateAgent: (agentId, patch) => {
      updateData((current) => updateAgent(current, currentUser, agentId, patch));
      setNotice('Agent update processed.');
    },
    deactivateAgent: (agentId) => {
      updateData((current) => deactivateAgent(current, currentUser, agentId));
      setNotice('Agent deactivation request processed.');
    },
    deleteAgent: (agentId) => {
      updateData((current) => deleteAgent(current, currentUser, agentId));
      setNotice('Agent delete request processed.');
    },
    transferAgent: (agentId, toTeamId, reason) => {
      updateData((current) => transferAgentTeam(current, currentUser, agentId, toTeamId, reason));
      setNotice('Agent transfer request processed.');
    },
    reassignProperty: (propertyId, targetAgentId, reason) => {
      const property = data.properties.find((item) => item.id === propertyId);
      const targetAgent = data.agents.find((agent) => agent.id === targetAgentId);
      if (!canReassignProperty(currentUser, property, targetAgent, data.teams)) {
        updateData((current) => logDenied(current, currentUser, 'property_reassigned', 'property', propertyId, 'Cannot reassign property outside scope.'));
        setNotice('You cannot reassign that property to the selected agent.');
        return;
      }
      updateData((current) => reassignPropertyOwnership(current, currentUser, propertyId, targetAgentId, reason));
      setNotice('Property reassignment processed.');
    },
    reassignTask: (taskId, targetAgentId, reason) => {
      updateData((current) => reassignTaskOwnership(current, currentUser, taskId, targetAgentId, reason));
      setNotice('Task reassignment processed.');
    },
    logout: async () => {
      await authLogout();
      setCurrentUserId(null);
      setRoute({ name: 'home' });
      setNotice(null);
    },
    resetDemo: async () => {
      if (!can(currentUser, PERMISSIONS.MANAGE_SETTINGS)) {
        updateData((current) => logDenied(current, currentUser, 'settings_reset', 'settings', 'demo', 'Only manager/admin can reset demo data.'));
        setNotice('Only manager/admin can reset demo data.');
        return;
      }
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
      if (!can(currentUser, PERMISSIONS.MANAGE_SETTINGS)) {
        updateData((current) => logDenied(current, currentUser, 'settings_seed', 'settings', 'demo', 'Only manager/admin can seed demo data.'));
        setNotice('Only manager/admin can seed demo data.');
        return;
      }
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

  async function handleLogin(email, password) {
    const result = await authLogin(email, password, data.users || data.agents);
    setLoginError(result.error);
    if (result.user) {
      setCurrentUserId(result.user.id);
      setRoute({ name: 'home' });
      setNotice(`Signed in as ${result.user.name}.`);
    }
  }

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading CRM workspace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoginScreen onLogin={handleLogin} error={loginError} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={responsive.showSidebar ? styles.desktopShell : styles.mobileShell}>
        {responsive.showSidebar ? (
          <SidebarNav activeTab={tabName} onChange={setTab} currentUser={currentUser} onLogout={actions.logout} />
        ) : null}
        <View style={styles.mainPane}>
        <AppHeader routeLabel={routeTitles[route.name]} currentUser={currentUser} compact={responsive.isDesktop} onLogout={actions.logout} team={helpers.teamById[currentUser.teamId]} />
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
    fontWeight: '800',
  },
});
