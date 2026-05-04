import { WORKFLOW_PHASES } from '../data/workflowPhases.js';
import { calculateCommission } from './commissionUtils.js';
import { daysUntil, getBiweeklyWindow, isBetween } from './dateUtils.js';

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function rowsFromCounts(counts, labels = {}) {
  return Object.entries(counts)
    .map(([key, value]) => ({ label: labels[key] || key, value }))
    .sort((a, b) => b.value - a.value);
}

function getClosed(properties) {
  return properties.filter((property) => property.status === 'closed');
}

function getActive(properties) {
  return properties.filter((property) => !['closed', 'archived', 'expired'].includes(property.status));
}

export function buildAnalytics(data, filters = {}) {
  const window = filters.start && filters.end ? { start: filters.start, end: filters.end } : getBiweeklyWindow();
  const properties = data.properties || [];
  const activeProperties = getActive(properties);
  const closedProperties = getClosed(properties);
  const signedInWindow = properties.filter((property) => isBetween(property.createdAt, window.start, window.end));
  const closedInWindow = closedProperties.filter((property) => isBetween(property.closedAt, window.start, window.end));
  const tasks = data.tasks || [];
  const openTasks = tasks.filter((task) => task.status !== 'done');
  const overdueTasks = openTasks.filter((task) => daysUntil(task.dueDate) < 0);
  const expiringAgreements = activeProperties.filter((property) => {
    const days = daysUntil(property.agreementEndDate);
    return days !== null && days <= 30;
  });
  const potentialCommission = activeProperties.reduce(
    (sum, property) => sum + calculateCommission(property).totalCommission,
    0,
  );
  const confirmedCommission = closedProperties.reduce(
    (sum, property) => sum + calculateCommission(property).totalCommission,
    0,
  );

  const agentRows = (data.agents || [])
    .filter((agent) => agent.role !== 'manager' && agent.role !== 'admin')
    .map((agent) => {
      const agentProperties = properties.filter((property) => property.ownerAgentId === agent.id || property.agentId === agent.id);
      const active = getActive(agentProperties);
      const closed = getClosed(agentProperties);
      const agentTasks = openTasks.filter((task) => task.assignedAgentId === agent.id || task.agentId === agent.id);
      return {
        agent,
        activeInventory: active.length,
        closedDeals: closed.length,
        signedAgreements: signedInWindow.filter((property) => property.ownerAgentId === agent.id || property.agentId === agent.id).length,
        potentialCommission: active.reduce((sum, property) => sum + calculateCommission(property).totalCommission, 0),
        confirmedCommission: closed.reduce((sum, property) => sum + calculateCommission(property).totalCommission, 0),
        taskLoad: agentTasks.length,
        overdueTasks: agentTasks.filter((task) => daysUntil(task.dueDate) < 0).length,
        targetProgress: Math.round((active.length / Math.max(agent.target || 1, 1)) * 100),
      };
    });

  const teamRows = (data.teams || []).map((team) => {
    const teamProperties = properties.filter((property) => property.teamId === team.id);
    const active = getActive(teamProperties);
    const closed = getClosed(teamProperties);
    return {
      team,
      activeInventory: active.length,
      closedDeals: closed.length,
      potentialCommission: active.reduce((sum, property) => sum + calculateCommission(property).totalCommission, 0),
      confirmedCommission: closed.reduce((sum, property) => sum + calculateCommission(property).totalCommission, 0),
      targetProgress: Math.round((active.length / Math.max(team.target || 1, 1)) * 100),
    };
  });

  const phaseDistribution = WORKFLOW_PHASES.map((phase) => ({
    label: `P${phase.id}`,
    title: phase.title,
    value: properties.filter((property) => Number(property.currentPhase) === phase.id).length,
    color: phase.color,
  }));
  const bottleneckPhase = [...phaseDistribution].sort((a, b) => b.value - a.value)[0];

  const sourceRows = rowsFromCounts(countBy(properties, (property) => property.source));
  const sourcePerformance = sourceRows.map((source) => {
    const sourceProperties = properties.filter((property) => property.source === source.label);
    const closed = getClosed(sourceProperties).length;
    return {
      ...source,
      closed,
      conversionRate: Math.round((closed / Math.max(sourceProperties.length, 1)) * 100),
    };
  });

  const recommendations = [
    expiringAgreements.length ? `Renew or replace ${expiringAgreements.length} agreements expiring within 30 days.` : 'Agreement expiry risk is controlled.',
    overdueTasks.length ? `Clear ${overdueTasks.length} overdue follow-ups before adding more previews.` : 'Follow-up workload is current.',
    bottleneckPhase?.value ? `Review bottleneck phase ${bottleneckPhase.label} (${bottleneckPhase.title}) with ${bottleneckPhase.value} deals.` : 'Pipeline is balanced.',
  ];

  return {
    window,
    activeProperties,
    closedProperties,
    signedInWindow,
    closedInWindow,
    potentialCommission,
    confirmedCommission,
    agentRows,
    teamRows,
    openTasks,
    overdueTasks,
    expiringAgreements,
    phaseDistribution,
    bottleneckPhase,
    conversionRate: Math.round((closedProperties.length / Math.max(properties.length, 1)) * 100),
    agreementTypeRatio: rowsFromCounts(countBy(activeProperties, (property) => property.agreementType)),
    transactionRatio: rowsFromCounts(countBy(properties, (property) => property.transactionType)),
    marketRatio: rowsFromCounts(countBy(properties, (property) => property.marketType)),
    sourcePerformance,
    topClosingAgents: [...agentRows].sort((a, b) => b.closedDeals - a.closedDeals).slice(0, 5),
    topInventoryAgents: [...agentRows].sort((a, b) => b.activeInventory - a.activeInventory).slice(0, 5),
    topCommissionAgents: [...agentRows].sort((a, b) => b.confirmedCommission - a.confirmedCommission).slice(0, 5),
    teamRanking: [...teamRows].sort((a, b) => b.confirmedCommission - a.confirmedCommission),
    recommendations,
  };
}

export function buildExportReadyReport(analytics, currentUser) {
  const roleLabel = currentUser?.role?.replace('_', ' ') || 'manager';
  const topAgent = analytics.topCommissionAgents[0];
  const topTeam = analytics.teamRanking[0];

  return [
    'Executive Summary',
    `Scope: ${roleLabel}. Active inventory: ${analytics.activeProperties.length}. Closed deals: ${analytics.closedProperties.length}. Conversion rate: ${analytics.conversionRate}%.`,
    '',
    'Agreements & Inventory',
    `${analytics.signedInWindow.length} agreements were signed in the selected window. ${analytics.expiringAgreements.length} agreements are at expiry risk.`,
    '',
    'Deal Pipeline',
    `Bottleneck: ${analytics.bottleneckPhase?.label || 'n/a'} ${analytics.bottleneckPhase?.title || ''}. Deals closed this biweekly period: ${analytics.closedInWindow.length}.`,
    '',
    'Commission Analysis',
    `Confirmed commission is ${analytics.confirmedCommission}. Potential commission is ${analytics.potentialCommission}.`,
    '',
    'Team Performance',
    topTeam ? `${topTeam.team.name} leads teams by confirmed commission.` : 'No team ranking available.',
    '',
    'Agent Performance',
    topAgent ? `${topAgent.agent.name} leads agents by confirmed commission.` : 'No agent ranking available.',
    '',
    'Risk & Follow-up Alerts',
    `${analytics.overdueTasks.length} overdue follow-ups and ${analytics.expiringAgreements.length} expiring agreements need attention.`,
    '',
    'Source Quality Analysis',
    analytics.sourcePerformance.map((row) => `${row.label}: ${row.value} leads, ${row.conversionRate}% conversion`).join('; '),
    '',
    'Recommendations',
    analytics.recommendations.join(' '),
  ].join('\n');
}
