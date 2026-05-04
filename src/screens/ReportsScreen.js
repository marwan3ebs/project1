import React from 'react';
import { Text, View } from 'react-native';

import { Card, PrimaryButton, ProgressBar, SectionHeader, StatCard } from '../components/index.js';
import { getPhase } from '../services/crmService.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { formatDate } from '../utils/dateUtils.js';
import { generateBiweeklyReport } from '../utils/reportUtils.js';
import { screen } from './screenStyles.js';

export function ReportsScreen({ data }) {
  const report = generateBiweeklyReport(data);
  const exportText = buildExportText(report);

  return (
    <View>
      <SectionHeader
        title="Biweekly report"
        subtitle={`${formatDate(report.window.start)} to ${formatDate(report.window.end)}`}
      />

      <View style={screen.grid}>
        <StatCard label="Agreements signed" value={report.signedThisPeriod.length} detail="Current window" />
        <StatCard label="Deals closed" value={report.closedThisPeriod.length} detail="Current window" tone="rose" />
        <StatCard label="Closed commission" value={formatMoney(report.totalClosedCommission)} detail="Confirmed" tone="amber" />
        <StatCard label="Potential commission" value={formatMoney(report.totalPotentialCommission)} detail="Open pipeline" tone="slate" />
      </View>

      <SectionHeader title="Agent performance" subtitle="Signed, closed, inventory, exclusives, commission" />
      {report.agentRows.map((row) => (
        <Card key={row.agent.id}>
          <View style={screen.rowBetween}>
            <View>
              <Text style={screen.title}>{row.agent.name}</Text>
              <Text style={screen.meta}>{row.agent.role.replace('_', ' ')}</Text>
            </View>
            <Text style={screen.title}>{formatMoney(row.commission)}</Text>
          </View>
          <View style={screen.detailGrid}>
            <Info label="Signed" value={row.signedAgreements} />
            <Info label="Closed" value={row.closedDeals} />
            <Info label="Active" value={row.activeInventory} />
            <Info label="Exclusive" value={row.exclusiveListings} />
          </View>
        </Card>
      ))}

      <SectionHeader title="Pipeline distribution" />
      <Card>
        {report.phaseCounts.map((phase) => {
          const phaseInfo = getPhase(phase.id);
          return (
            <View key={phase.id} style={{ marginBottom: 10 }}>
              <View style={screen.rowBetween}>
                <Text style={screen.meta}>P{phase.id} {phase.title}</Text>
                <Text style={screen.meta}>{phase.count}</Text>
              </View>
              <ProgressBar
                value={(phase.count / Math.max(data.properties.length, 1)) * 100}
                color={phaseInfo.color}
              />
            </View>
          );
        })}
      </Card>

      <SectionHeader title="Team totals" />
      {report.teamTotals.map((row) => (
        <Card key={row.team.id}>
          <View style={screen.rowBetween}>
            <Text style={screen.title}>{row.team.name}</Text>
            <Text style={screen.title}>{formatMoney(row.commission)}</Text>
          </View>
          <Text style={screen.body}>
            {row.activeInventory} active listings | {row.closedDeals} closed deals
          </Text>
        </Card>
      ))}

      <SectionHeader title="Export-ready summary" subtitle="Use this text in the university presentation or manager report" />
      <Card>
        <Text style={screen.body}>{exportText}</Text>
        <View style={screen.actionRow}>
          <PrimaryButton label="Generate Biweekly Report" onPress={() => {}} style={screen.actionFlex} />
        </View>
      </Card>
    </View>
  );
}

function buildExportText(report) {
  const topAgent = [...report.agentRows].sort((a, b) => b.commission - a.commission)[0];

  return [
    `Biweekly CRM summary from ${formatDate(report.window.start)} to ${formatDate(report.window.end)}.`,
    `${report.signedThisPeriod.length} agreements were signed and ${report.closedThisPeriod.length} deals were closed.`,
    `Confirmed commission in this window is ${formatMoney(report.totalClosedCommission)}.`,
    `Open pipeline potential commission is ${formatMoney(report.totalPotentialCommission)}.`,
    topAgent ? `Top production: ${topAgent.agent.name} with ${formatMoney(topAgent.commission)} confirmed commission.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function Info({ label, value }) {
  return (
    <View style={screen.infoBlock}>
      <Text style={screen.infoLabel}>{label}</Text>
      <Text style={screen.infoValue}>{value}</Text>
    </View>
  );
}
