import React, { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  ActionMenu,
  Card,
  FilterChip,
  FormInput,
  ProgressBar,
  SectionHeader,
  SelectInput,
  StatCard,
  StatusBadge,
  TeamHierarchyTree,
} from '../components/index.js';
import { ROLES, canManageUser, isManagerRole } from '../auth/index.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { daysUntil } from '../utils/dateUtils.js';
import { hasActiveOwnedWork } from '../utils/ownershipUtils.js';
import { screen } from './screenStyles.js';

function emptyAgentForm(data) {
  return {
    name: '',
    email: '',
    phone: '',
    role: ROLES.AGENT,
    teamId: data.teams[0]?.id || '',
    target: '5',
    status: 'active',
  };
}

export function TeamScreen({ data, allData, currentUser, actions }) {
  const [teamId, setTeamId] = useState(data.teams[0]?.id || '');
  const [agentForm, setAgentForm] = useState(() => emptyAgentForm(data));
  const [editAgentId, setEditAgentId] = useState(data.agents.find((agent) => agent.role !== 'manager')?.id || '');
  const [transferAgentId, setTransferAgentId] = useState(data.agents.find((agent) => agent.role === 'agent')?.id || '');
  const [transferTeamId, setTransferTeamId] = useState(data.teams[1]?.id || data.teams[0]?.id || '');
  const [propertyId, setPropertyId] = useState(data.properties[0]?.id || '');
  const [propertyAgentId, setPropertyAgentId] = useState(data.agents.find((agent) => agent.role === 'agent')?.id || '');
  const [taskId, setTaskId] = useState(data.tasks[0]?.id || '');
  const [taskAgentId, setTaskAgentId] = useState(data.agents.find((agent) => agent.role === 'agent')?.id || '');
  const [section, setSection] = useState('overview');

  const teamOptions = data.teams.map((team) => ({ value: team.id, label: team.name }));
  const activeTeamId = teamId || data.teams[0]?.id;
  const teamAgents = useMemo(
    () => data.agents.filter((agent) => agent.teamId === activeTeamId),
    [activeTeamId, data.agents],
  );
  const teamProperties = data.properties.filter((property) => property.teamId === activeTeamId);
  const activeProperties = teamProperties.filter((property) => !['closed', 'archived', 'expired'].includes(property.status));
  const closedProperties = teamProperties.filter((property) => property.status === 'closed');
  const teamCommission = closedProperties.reduce(
    (sum, property) => sum + calculateCommission(property).totalCommission,
    0,
  );
  const selectedEditAgent = (allData?.agents || data.agents).find((agent) => agent.id === editAgentId);
  const manageable = canManageUser(currentUser);
  const agentOptions = data.agents
    .filter((agent) => agent.role !== ROLES.MANAGER && agent.role !== ROLES.ADMIN)
    .map((agent) => ({ value: agent.id, label: agent.name }));
  const allTeamOptions = (allData?.teams || data.teams).map((team) => ({ value: team.id, label: team.name }));
  const propertyOptions = data.properties.map((property) => ({ value: property.id, label: `${property.agreementCode} ${property.location}` }));
  const taskOptions = data.tasks.map((task) => ({ value: task.id, label: task.title }));
  const auditLog = allData?.auditLog || data.auditLog || [];
  const ownershipHistory = allData?.ownershipHistory || data.ownershipHistory || [];

  function updateAgentForm(key, value) {
    setAgentForm((current) => ({ ...current, [key]: value }));
  }

  function submitAgent() {
    if (!agentForm.name.trim() || !agentForm.phone.trim() || !agentForm.email.trim()) {
      Alert.alert('Missing agent details', 'Name, phone, and email are required.');
      return;
    }
    actions.addAgent(agentForm);
    setAgentForm(emptyAgentForm(data));
  }

  function saveSelectedAgent() {
    if (!selectedEditAgent) {
      return;
    }
    actions.updateAgent(selectedEditAgent.id, {
      name: selectedEditAgent.name,
      email: selectedEditAgent.email,
      phone: selectedEditAgent.phone,
      target: selectedEditAgent.target,
      role: selectedEditAgent.role,
      status: selectedEditAgent.status,
    });
  }

  return (
    <View>
      <SectionHeader title="Ownership and team management" subtitle="Hierarchy, targets, reassignment, and audit history" />
      {currentUser?.role !== ROLES.AGENT ? (
        <SelectInput label="Team" options={teamOptions} value={activeTeamId} onChange={setTeamId} />
      ) : null}

      <View style={screen.wrapRow}>
        {[
          ['overview', 'Overview'],
          ['hierarchy', 'Hierarchy'],
          ['agents', 'Agents'],
          currentUser?.role !== ROLES.AGENT && ['transfers', 'Transfers'],
          currentUser?.role !== ROLES.AGENT && ['reassignment', 'Reassignment'],
          ['audit', 'Audit log'],
        ].filter(Boolean).map(([value, label]) => (
          <FilterChip key={value} label={label} active={section === value} onPress={() => setSection(value)} />
        ))}
      </View>

      {section === 'hierarchy' ? (
        <Card>
          <TeamHierarchyTree
            teams={data.teams}
            agents={data.agents}
            manager={(allData?.agents || data.agents).find((agent) => agent.role === ROLES.MANAGER || agent.role === ROLES.ADMIN)}
          />
        </Card>
      ) : null}

      {section === 'overview' ? (
        <>
          <View style={screen.grid}>
            <StatCard label="Team inventory" value={activeProperties.length} detail="Active agreements" />
            <StatCard label="Closed deals" value={closedProperties.length} detail="All time" tone="rose" />
            <StatCard label="Commission" value={formatMoney(teamCommission)} detail="Confirmed" tone="amber" />
            <StatCard label="Active agents" value={teamAgents.filter((agent) => agent.status !== 'inactive').length} detail="In scope" tone="slate" />
          </View>
          <Card>
            <View style={screen.detailGrid}>
              <Info label="Overdue tasks" value={data.tasks.filter((task) => task.teamId === activeTeamId && task.status !== 'done').length} />
              <Info label="Expiring agreements" value={data.properties.filter((property) => property.teamId === activeTeamId && property.status === 'active' && daysUntil(property.agreementEndDate) <= 30).length} />
              <Info label="Team target" value={data.teams.find((team) => team.id === activeTeamId)?.target || 0} />
              <Info label="Inactive agents" value={teamAgents.filter((agent) => agent.status === 'inactive').length} />
            </View>
          </Card>
        </>
      ) : null}

      {section === 'agents' ? (
        <>
          <SectionHeader title="Agent scorecards" />
          {teamAgents.map((agent) => {
        const agentProperties = data.properties.filter((property) => property.ownerAgentId === agent.id || property.agentId === agent.id);
        const active = agentProperties.filter((property) => !['closed', 'archived', 'expired'].includes(property.status));
        const closed = agentProperties.filter((property) => property.status === 'closed');
        const exclusive = active.filter((property) => property.agreementType === 'exclusive');
        const followUps = data.tasks.filter(
          (task) => (task.assignedAgentId === agent.id || task.agentId === agent.id) && task.status !== 'done',
        );
        const commission = closed.reduce(
          (sum, property) => sum + calculateCommission(property).totalCommission,
          0,
        );
        const progress = (active.length / Math.max(agent.target || 1, 1)) * 100;
        const work = hasActiveOwnedWork(allData || data, agent.id);

            return (
              <Card key={agent.id}>
            <View style={screen.rowBetween}>
              <View>
                <Text style={screen.title}>{agent.name}</Text>
                <Text style={screen.meta}>{agent.phone} | {agent.email}</Text>
              </View>
              <StatusBadge label={agent.status === 'inactive' ? 'Inactive' : `${active.length}/${agent.target} target`} tone={agent.status === 'inactive' ? 'danger' : progress >= 100 ? 'success' : 'info'} />
            </View>
            <View style={screen.detailGrid}>
              <Info label="Inventory" value={active.length} />
              <Info label="Closed" value={closed.length} />
              <Info label="Exclusive" value={exclusive.length} />
              <Info label="Follow-ups" value={followUps.length} />
              <Info label="Commission" value={formatMoney(commission)} />
              <Info label="Owned work" value={`${work.activeProperties.length} properties / ${work.activeTasks.length} tasks`} />
            </View>
            <View style={{ marginTop: 12 }}>
              <ProgressBar value={progress} color={progress >= 100 ? '#16a34a' : '#0f766e'} />
            </View>
            {manageable ? (
              <ActionMenu
                actions={[
                  { label: 'Edit target', onPress: () => setEditAgentId(agent.id) },
                  { label: 'Deactivate', tone: 'danger', onPress: () => actions.deactivateAgent(agent.id) },
                  isManagerRole(currentUser?.role) && { label: 'Delete', tone: 'danger', onPress: () => actions.deleteAgent(agent.id) },
                ]}
              />
            ) : null}
              </Card>
            );
          })}
        </>
      ) : null}

      {section === 'agents' && manageable ? (
        <>
          <SectionHeader title="Add agent" subtitle="Manager/admin user creation" />
          <Card>
            <FormInput label="Name" value={agentForm.name} onChangeText={(value) => updateAgentForm('name', value)} />
            <FormInput label="Phone" value={agentForm.phone} onChangeText={(value) => updateAgentForm('phone', value)} keyboardType="phone-pad" />
            <FormInput label="Email" value={agentForm.email} onChangeText={(value) => updateAgentForm('email', value)} />
            <SelectInput label="Role" options={[
              { value: ROLES.AGENT, label: 'Agent' },
              { value: ROLES.TEAM_LEADER, label: 'Team Leader' },
              { value: ROLES.MANAGER, label: 'Manager' },
            ]} value={agentForm.role} onChange={(value) => updateAgentForm('role', value)} />
            <SelectInput label="Team" options={allTeamOptions} value={agentForm.teamId} onChange={(value) => updateAgentForm('teamId', value)} />
            <FormInput label="Target" value={agentForm.target} onChangeText={(value) => updateAgentForm('target', value)} keyboardType="numeric" />
            <ActionMenu actions={[{ label: 'Add agent', tone: 'primary', onPress: submitAgent }]} />
          </Card>

          <SectionHeader title="Edit agent" subtitle="Manager/admin profile and role edits" />
          <Card>
            <SelectInput label="Agent" options={agentOptions} value={editAgentId} onChange={setEditAgentId} />
            {selectedEditAgent ? (
              <>
                <View style={screen.detailGrid}>
                  <Info label="Name" value={selectedEditAgent.name} />
                  <Info label="Phone" value={selectedEditAgent.phone} />
                  <Info label="Email" value={selectedEditAgent.email} />
                  <Info label="Target" value={selectedEditAgent.target} />
                </View>
                <Text style={screen.body}>
                  Use the scorecard action to select an agent, then update target/status through the quick actions below. Hard delete is blocked when active owned work exists.
                </Text>
                <ActionMenu actions={[
                  { label: 'Target +1', onPress: () => actions.updateAgent(selectedEditAgent.id, { target: Number(selectedEditAgent.target || 0) + 1 }) },
                  { label: 'Activate', onPress: () => actions.updateAgent(selectedEditAgent.id, { status: 'active' }) },
                  { label: 'Deactivate', tone: 'danger', onPress: () => actions.deactivateAgent(selectedEditAgent.id) },
                ]} />
              </>
            ) : null}
          </Card>
        </>
      ) : null}

      {section === 'transfers' ? (
        <>
          <SectionHeader title="Transfers" subtitle="Move agents between teams with audit history" />
          <Card>
        <SelectInput label="Transfer agent" options={agentOptions} value={transferAgentId} onChange={setTransferAgentId} />
        <SelectInput label="Move to team" options={allTeamOptions} value={transferTeamId} onChange={setTransferTeamId} />
        <ActionMenu actions={[
          { label: 'Transfer agent', tone: 'dark', onPress: () => actions.transferAgent(transferAgentId, transferTeamId, 'Team capacity balancing') },
        ]} />
          </Card>
        </>
      ) : null}

      {section === 'reassignment' ? (
        <>
          <SectionHeader title="Reassignment" subtitle="Change property and task ownership inside allowed scope" />
          <Card>
        <SelectInput label="Property" options={propertyOptions} value={propertyId} onChange={setPropertyId} />
        <SelectInput label="New owner" options={agentOptions} value={propertyAgentId} onChange={setPropertyAgentId} />
        <ActionMenu actions={[
          { label: 'Reassign property', onPress: () => actions.reassignProperty(propertyId, propertyAgentId, 'Pipeline ownership change') },
        ]} />
        <View style={screen.divider} />
        <SelectInput label="Task" options={taskOptions} value={taskId} onChange={setTaskId} />
        <SelectInput label="Assign to" options={agentOptions} value={taskAgentId} onChange={setTaskAgentId} />
        <ActionMenu actions={[
          { label: 'Reassign task', onPress: () => actions.reassignTask(taskId, taskAgentId, 'Workload balancing') },
        ]} />
          </Card>
        </>
      ) : null}

      {section === 'audit' ? (
        <>
          <SectionHeader title="Ownership history" subtitle="Latest transfer/reassignment events" />
          {ownershipHistory.slice(0, 6).map((entry) => (
            <Card key={entry.id}>
              <Text style={screen.title}>{entry.action}</Text>
              <Text style={screen.meta}>{entry.entityType} {entry.entityId} | {entry.createdAt}</Text>
              <Text style={screen.body}>
                {entry.fromUserId || entry.fromTeamId || 'n/a'} to {entry.toUserId || entry.toTeamId || 'n/a'} | {entry.reason}
              </Text>
            </Card>
          ))}

          <SectionHeader title="Audit log" subtitle="Success and denied RBAC events" />
          {auditLog.slice(0, 8).map((entry) => (
            <Card key={entry.id}>
              <View style={screen.rowBetween}>
                <Text style={screen.title}>{entry.action}</Text>
                <StatusBadge label={entry.result} tone={entry.result === 'denied' ? 'danger' : 'success'} />
              </View>
              <Text style={screen.meta}>{entry.role} | {entry.targetType} {entry.targetId} | {entry.createdAt}</Text>
              <Text style={screen.body}>{entry.details}</Text>
            </Card>
          ))}
        </>
      ) : null}
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
