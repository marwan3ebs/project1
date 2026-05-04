import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  BarChart,
  Card,
  ChartCard,
  DonutChart,
  HorizontalBarChart,
  MetricTrend,
  SectionHeader,
  SelectInput,
  StatCard,
} from '../components/index.js';
import { canViewReport, isManagerRole } from '../auth/index.js';
import { buildAnalytics, buildExportReadyReport } from '../utils/analyticsUtils.js';
import { formatMoney } from '../utils/commissionUtils.js';
import { formatDate, getBiweeklyWindow } from '../utils/dateUtils.js';
import { screen } from './screenStyles.js';

export function ReportsScreen({ data, currentUser }) {
  const defaultWindow = getBiweeklyWindow();
  const [datePreset, setDatePreset] = useState('biweekly');
  const [teamId, setTeamId] = useState('all');
  const [agentId, setAgentId] = useState('all');
  const [generatedAt, setGeneratedAt] = useState(null);

  const scopedData = useMemo(() => {
    let properties = data.properties || [];
    let tasks = data.tasks || [];
    let agents = data.agents || [];
    let teams = data.teams || [];
    let agreements = data.agreements || [];
    let deals = data.deals || [];

    if (teamId !== 'all') {
      properties = properties.filter((property) => property.teamId === teamId);
      tasks = tasks.filter((task) => task.teamId === teamId);
      agents = agents.filter((agent) => agent.teamId === teamId || agent.teamIds?.includes(teamId));
      teams = teams.filter((team) => team.id === teamId);
      agreements = agreements.filter((agreement) => agreement.teamId === teamId);
      deals = deals.filter((deal) => deal.teamId === teamId);
    }

    if (agentId !== 'all') {
      properties = properties.filter((property) => property.ownerAgentId === agentId || property.agentId === agentId);
      tasks = tasks.filter((task) => task.assignedAgentId === agentId || task.agentId === agentId);
      agents = agents.filter((agent) => agent.id === agentId);
      agreements = agreements.filter((agreement) => agreement.ownerAgentId === agentId || agreement.agentId === agentId);
      deals = deals.filter((deal) => deal.ownerAgentId === agentId || deal.agentId === agentId);
    }

    return { ...data, properties, tasks, agents, teams, agreements, deals };
  }, [agentId, data, teamId]);

  const reportWindow = datePreset === 'all'
    ? { start: '2000-01-01', end: defaultWindow.end }
    : defaultWindow;
  const analytics = buildAnalytics(scopedData, reportWindow);
  const exportText = buildExportReadyReport(
    {
      ...analytics,
      confirmedCommission: formatMoney(analytics.confirmedCommission),
      potentialCommission: formatMoney(analytics.potentialCommission),
    },
    currentUser,
  );

  const teamOptions = [{ value: 'all', label: 'All teams' }, ...data.teams.map((team) => ({ value: team.id, label: team.name }))];
  const agentOptions = [
    { value: 'all', label: 'All agents' },
    ...data.agents.filter((agent) => agent.role !== 'manager' && agent.role !== 'admin').map((agent) => ({ value: agent.id, label: agent.name })),
  ];

  if (!canViewReport(currentUser, isManagerRole(currentUser?.role) ? 'company' : currentUser?.role === 'team_leader' ? 'team' : 'personal')) {
    return (
      <Card>
        <Text style={screen.title}>Reports unavailable</Text>
        <Text style={screen.body}>This role cannot view the selected report scope.</Text>
      </Card>
    );
  }

  return (
    <View>
      <SectionHeader
        title="Analytics and reports"
        subtitle={`${formatDate(reportWindow.start)} to ${formatDate(reportWindow.end)}`}
      />

      <Card>
        <SelectInput
          label="Date range"
          options={[
            { value: 'biweekly', label: 'Current biweekly' },
            { value: 'all', label: 'All demo data' },
          ]}
          value={datePreset}
          onChange={setDatePreset}
        />
        {isManagerRole(currentUser?.role) ? (
          <SelectInput label="Team filter" options={teamOptions} value={teamId} onChange={setTeamId} />
        ) : null}
        {currentUser?.role !== 'agent' ? (
          <SelectInput label="Agent filter" options={agentOptions} value={agentId} onChange={setAgentId} />
        ) : null}
      </Card>

      <View style={screen.grid}>
        <StatCard label="Active inventory" value={analytics.activeProperties.length} detail="Scoped listings" />
        <StatCard label="Signed agreements" value={analytics.signedInWindow.length} detail="Selected window" tone="amber" />
        <StatCard label="Closed deals" value={analytics.closedInWindow.length} detail="Selected window" tone="rose" />
        <StatCard label="Confirmed commission" value={formatMoney(analytics.confirmedCommission)} detail="Closed deals" tone="slate" />
        <StatCard label="Potential commission" value={formatMoney(analytics.potentialCommission)} detail="Open pipeline" />
        <StatCard label="Conversion rate" value={`${analytics.conversionRate}%`} detail="All scoped deals" tone="amber" />
      </View>

      <SectionHeader title="Executive Summary" subtitle="High-signal operating metrics" />
      <View style={screen.grid}>
        <MetricTrend label="Closed in window" value={analytics.closedInWindow.length} trend={analytics.closedInWindow.length ? 12 : 0} />
        <MetricTrend label="Expiry risk" value={analytics.expiringAgreements.length} trend={analytics.expiringAgreements.length ? -8 : 0} />
        <MetricTrend label="Overdue follow-ups" value={analytics.overdueTasks.length} trend={analytics.overdueTasks.length ? -15 : 5} />
      </View>

      <SectionHeader title="Agreements & Inventory" />
      <View style={screen.grid}>
        <ChartCard title="Open vs exclusive" subtitle="Active agreement mix">
          <DonutChart
            data={analytics.agreementTypeRatio.map((row, index) => ({
              ...row,
              color: ['#0f766e', '#2563eb', '#c2410c'][index % 3],
            }))}
          />
        </ChartCard>
        <ChartCard title="Primary vs resale" subtitle="Inventory market mix">
          <HorizontalBarChart data={analytics.marketRatio} />
        </ChartCard>
      </View>

      <SectionHeader title="Deal Pipeline" />
      <View style={screen.grid}>
        <ChartCard title="Phase distribution" subtitle="Workflow bottlenecks">
          <BarChart data={analytics.phaseDistribution} />
        </ChartCard>
        <ChartCard title="Rent vs purchase" subtitle="Transaction mix">
          <HorizontalBarChart data={analytics.transactionRatio} color="#2563eb" />
        </ChartCard>
      </View>

      <SectionHeader title="Commission Analysis" />
      <View style={screen.grid}>
        <ChartCard title="Top commission agents" subtitle="Confirmed commission">
          <HorizontalBarChart
            data={analytics.topCommissionAgents.map((row) => ({
              label: row.agent.name,
              value: row.confirmedCommission,
            }))}
            color="#c2410c"
            valueFormatter={formatMoney}
          />
        </ChartCard>
        <ChartCard title="Team ranking" subtitle="Confirmed commission">
          <HorizontalBarChart
            data={analytics.teamRanking.map((row) => ({ label: row.team.name, value: row.confirmedCommission }))}
            color="#0f766e"
            valueFormatter={formatMoney}
          />
        </ChartCard>
      </View>

      <SectionHeader title="Agent Performance" />
      {analytics.agentRows.map((row) => (
        <Card key={row.agent.id}>
          <View style={screen.rowBetween}>
            <View>
              <Text style={screen.title}>{row.agent.name}</Text>
              <Text style={screen.meta}>{row.agent.role.replace('_', ' ')} | target {row.targetProgress}%</Text>
            </View>
            <Text style={screen.title}>{formatMoney(row.confirmedCommission)}</Text>
          </View>
          <View style={screen.detailGrid}>
            <Info label="Inventory" value={row.activeInventory} />
            <Info label="Closed" value={row.closedDeals} />
            <Info label="Tasks" value={row.taskLoad} />
            <Info label="Overdue" value={row.overdueTasks} />
          </View>
        </Card>
      ))}

      <SectionHeader title="Risk & Follow-up Alerts" />
      <Card>
        <View style={screen.detailGrid}>
          <Info label="Expiring agreements" value={analytics.expiringAgreements.length} />
          <Info label="Overdue follow-ups" value={analytics.overdueTasks.length} />
          <Info label="Bottleneck phase" value={`${analytics.bottleneckPhase?.label || 'n/a'} ${analytics.bottleneckPhase?.title || ''}`} />
          <Info label="Open tasks" value={analytics.openTasks.length} />
        </View>
      </Card>

      <SectionHeader title="Source Quality Analysis" />
      <ChartCard title="Source performance" subtitle="Lead volume and conversion quality">
        <HorizontalBarChart data={analytics.sourcePerformance} color="#1d4ed8" />
        <View style={screen.divider} />
        {analytics.sourcePerformance.map((row) => (
          <Text key={row.label} style={screen.body}>
            {row.label}: {row.value} leads, {row.closed} closed, {row.conversionRate}% conversion
          </Text>
        ))}
      </ChartCard>

      <SectionHeader title="Recommendations" />
      <Card>
        {analytics.recommendations.map((item) => (
          <Text key={item} style={screen.body}>{item}</Text>
        ))}
      </Card>

      <SectionHeader title="Export-ready report text" subtitle="Manager/team report copy" />
      <Card>
        <Text style={screen.body}>{exportText}</Text>
        {generatedAt ? <Text style={screen.meta}>Generated locally at {generatedAt}</Text> : null}
        <View style={screen.actionRow}>
          <Text style={screen.meta}>Biweekly report generation is local and export-ready.</Text>
          <Text style={screen.title} onPress={() => setGeneratedAt(new Date().toLocaleString('en'))}>
            Generate
          </Text>
        </View>
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
