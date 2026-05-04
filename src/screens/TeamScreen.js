import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card, ProgressBar, SectionHeader, SelectInput, StatCard, StatusBadge, TeamHierarchyTree } from '../components/index.js';
import { ROLES } from '../auth/index.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { screen } from './screenStyles.js';

export function TeamScreen({ data, allData, currentUser }) {
  const [teamId, setTeamId] = useState(data.teams[0]?.id || '');
  const teamOptions = data.teams.map((team) => ({ value: team.id, label: team.name }));

  const teamAgents = useMemo(
    () => data.agents.filter((agent) => agent.teamId === teamId),
    [data.agents, teamId],
  );
  const agentIds = teamAgents.map((agent) => agent.id);
  const teamProperties = data.properties.filter((property) => agentIds.includes(property.agentId));
  const activeProperties = teamProperties.filter((property) => property.status !== 'closed');
  const closedProperties = teamProperties.filter((property) => property.status === 'closed');
  const teamCommission = closedProperties.reduce(
    (sum, property) => sum + calculateCommission(property).totalCommission,
    0,
  );

  return (
    <View>
      <SectionHeader title={currentUser?.role === ROLES.AGENT ? 'Personal performance' : 'Team leader dashboard'} subtitle="Inventory, targets, follow-up load, and commission" />
      {currentUser?.role !== ROLES.AGENT ? <SelectInput label="Team" options={teamOptions} value={teamId} onChange={setTeamId} /> : null}

      <Card>
        <TeamHierarchyTree teams={data.teams} agents={data.agents} manager={(allData?.agents || data.agents).find((agent) => agent.role === 'manager')} />
      </Card>

      <View style={screen.grid}>
        <StatCard label="Team inventory" value={activeProperties.length} detail="Active agreements" />
        <StatCard label="Closed deals" value={closedProperties.length} detail="All time" tone="rose" />
        <StatCard label="Commission" value={formatMoney(teamCommission)} detail="Confirmed" tone="amber" />
        <StatCard label="Exclusive listings" value={activeProperties.filter((property) => property.agreementType === 'exclusive').length} detail="Active" tone="slate" />
      </View>

      <SectionHeader title="Agent scorecards" />
      {teamAgents.map((agent) => {
        const agentProperties = data.properties.filter((property) => property.agentId === agent.id);
        const active = agentProperties.filter((property) => property.status !== 'closed');
        const closed = agentProperties.filter((property) => property.status === 'closed');
        const exclusive = active.filter((property) => property.agreementType === 'exclusive');
        const followUps = data.tasks.filter(
          (task) => task.agentId === agent.id && task.status !== 'done',
        );
        const commission = closed.reduce(
          (sum, property) => sum + calculateCommission(property).totalCommission,
          0,
        );
        const progress = (active.length / Math.max(agent.target || 1, 1)) * 100;

        return (
          <Card key={agent.id}>
            <View style={screen.rowBetween}>
              <View>
                <Text style={screen.title}>{agent.name}</Text>
                <Text style={screen.meta}>{agent.phone} | {agent.role.replace('_', ' ')}</Text>
              </View>
              <StatusBadge label={`${active.length}/${agent.target} target`} tone={progress >= 100 ? 'success' : 'info'} />
            </View>
            <View style={screen.detailGrid}>
              <Info label="Inventory" value={active.length} />
              <Info label="Closed" value={closed.length} />
              <Info label="Exclusive" value={exclusive.length} />
              <Info label="Follow-ups" value={followUps.length} />
              <Info label="Commission" value={formatMoney(commission)} />
            </View>
            <View style={{ marginTop: 12 }}>
              <ProgressBar value={progress} color={progress >= 100 ? '#16a34a' : '#0f766e'} />
            </View>
          </Card>
        );
      })}
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
