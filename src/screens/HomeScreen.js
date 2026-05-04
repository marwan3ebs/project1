import React from 'react';
import { Text, View } from 'react-native';

import {
  Card,
  EmptyState,
  PhaseBadge,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  StatCard,
  StatusBadge,
} from '../components/index.js';
import { WORKFLOW_PHASES } from '../data/workflowPhases.js';
import { getDashboardSummary, getPhase, getPhaseProgress } from '../services/crmService.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { formatDate } from '../utils/dateUtils.js';
import { screen } from './screenStyles.js';

export function HomeScreen({ data, helpers, reminders, actions, navigate }) {
  const summary = getDashboardSummary(data);
  const potentialCommission = data.properties
    .filter((property) => property.status !== 'closed')
    .reduce((sum, property) => sum + calculateCommission(property).totalCommission, 0);
  const openTasks = data.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    .slice(0, 4);

  const phaseCounts = WORKFLOW_PHASES.map((phase) => ({
    ...phase,
    count: data.properties.filter((property) => Number(property.currentPhase) === phase.id).length,
  }));

  const priorityDeals = data.properties
    .filter((property) => property.status !== 'closed')
    .sort((a, b) => Number(b.currentPhase) - Number(a.currentPhase))
    .slice(0, 3);

  return (
    <View>
      <SectionHeader
        title="CRM command center"
        subtitle="Inventory, agreements, follow-ups, and team output"
        actionLabel="Add"
        onAction={() => navigate('addProperty')}
      />

      <View style={screen.grid}>
        <StatCard label="Active inventory" value={summary.activeInventory} detail="Open units" />
        <StatCard label="Signed agreements" value={summary.signedAgreements} detail="Demo total" tone="amber" />
        <StatCard label="Closed deals" value={summary.closedDeals} detail="Commission ready" tone="rose" />
        <StatCard label="Potential commission" value={formatMoney(potentialCommission)} detail="Open pipeline" tone="slate" />
        <StatCard label="Ending soon" value={summary.agreementsEndingSoon} detail="Within 30 days" tone="amber" />
        <StatCard label="Today's tasks" value={summary.todayTasks} detail="Due or overdue" tone="rose" />
      </View>

      <SectionHeader title="Urgent reminders" subtitle="Agreement expiry and due follow-ups" />
      {reminders.length === 0 && openTasks.length === 0 ? (
        <EmptyState title="No urgent CRM work" body="There are no open reminders in the current demo data." />
      ) : null}
      {reminders.slice(0, 3).map(({ property, status }) => (
        <Card key={property.id}>
          <View style={screen.rowBetween}>
            <View>
              <Text style={screen.title}>{property.agreementCode}</Text>
              <Text style={screen.meta}>{property.customerName} | {property.location}</Text>
            </View>
            <StatusBadge label={status.label} tone={status.tone} />
          </View>
          <Text style={screen.body}>Agreement ends on {formatDate(property.agreementEndDate)}.</Text>
        </Card>
      ))}
      {openTasks.map((task) => (
        <Card key={task.id}>
          <View style={screen.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={screen.title}>{task.title}</Text>
              <Text style={screen.meta}>
                {formatDate(task.dueDate)} | {helpers.agentById[task.agentId]?.name || 'Unassigned'}
              </Text>
            </View>
            <StatusBadge label={task.priority} tone={task.priority === 'high' ? 'danger' : 'info'} />
          </View>
          <Text style={screen.body}>{task.notes}</Text>
          <View style={screen.actionRow}>
            <PrimaryButton
              label={task.status === 'done' ? 'Reopen' : 'Mark done'}
              onPress={() => actions.toggleTask(task.id)}
              tone="dark"
              style={screen.actionFlex}
            />
          </View>
        </Card>
      ))}

      <SectionHeader title="Pipeline summary" subtitle="Resale workflow phase distribution" />
      <Card>
        {phaseCounts.map((phase) => (
          <View key={phase.id} style={{ marginBottom: 10 }}>
            <View style={screen.rowBetween}>
              <Text style={screen.meta}>P{phase.id} {phase.title}</Text>
              <Text style={screen.meta}>{phase.count}</Text>
            </View>
            <ProgressBar
              value={(phase.count / Math.max(data.properties.length, 1)) * 100}
              color={phase.color}
            />
          </View>
        ))}
      </Card>

      <SectionHeader title="Highest priority deals" subtitle="Quick phase and closing controls" />
      {priorityDeals.map((property) => {
        const phase = getPhase(property.currentPhase);
        return (
          <Card key={property.id}>
            <View style={screen.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={screen.title}>{property.location}</Text>
                <Text style={screen.meta}>{property.agreementCode} | {property.agentName}</Text>
              </View>
              <PhaseBadge phaseId={property.currentPhase} />
            </View>
            <Text style={screen.body}>{property.customerName} | {formatMoney(property.price)}</Text>
            <View style={{ marginTop: 10 }}>
              <View style={screen.rowBetween}>
                <Text style={screen.meta}>{phase.title}</Text>
                <Text style={screen.meta}>{getPhaseProgress(property.currentPhase)}%</Text>
              </View>
              <ProgressBar value={getPhaseProgress(property.currentPhase)} color={phase.color} />
            </View>
            <View style={screen.actionRow}>
              <PrimaryButton label="View" onPress={() => navigate('propertyDetail', { propertyId: property.id })} style={screen.actionFlex} />
              <PrimaryButton label="Advance" onPress={() => actions.advancePhase(property.id)} tone="dark" style={screen.actionFlex} />
            </View>
          </Card>
        );
      })}
    </View>
  );
}
