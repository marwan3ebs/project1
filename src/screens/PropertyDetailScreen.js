import React from 'react';
import { Text, View } from 'react-native';

import {
  AgreementBadge,
  Card,
  EmptyState,
  PhaseBadge,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  StatusBadge,
} from '../components/index.js';
import { PROPERTY_TYPES, UNIT_SOURCES } from '../constants/index.js';
import { getAgreementStatus, getPhase, getPhaseProgress } from '../services/crmService.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { formatDate } from '../utils/dateUtils.js';
import { labelFor, screen } from './screenStyles.js';

export function PropertyDetailScreen({ data, helpers, actions, navigate, route }) {
  const property = helpers.propertyById[route.params?.propertyId];

  if (!property) {
    return (
      <EmptyState
        title="Property not found"
        body="The selected property is not available in the current demo data."
      />
    );
  }

  const phase = getPhase(property.currentPhase);
  const expiry = getAgreementStatus(property);
  const commission = calculateCommission(property);
  const relatedTasks = data.tasks.filter((task) => task.relatedPropertyId === property.id);

  return (
    <View>
      <SectionHeader title={property.location} subtitle={property.agreementCode} actionLabel="Back" onAction={() => navigate('inventory')} />

      <Card>
        <View style={screen.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={screen.title}>{property.customerName}</Text>
            <Text style={screen.meta}>{property.customerPhone} | {property.customerType}</Text>
          </View>
          <StatusBadge label={property.status === 'closed' ? 'Closed' : 'Active'} tone={property.status === 'closed' ? 'success' : 'primary'} />
        </View>
        <View style={[screen.wrapRow, { marginTop: 10 }]}>
          <AgreementBadge type={property.agreementType} />
          <PhaseBadge phaseId={property.currentPhase} />
          <StatusBadge label={expiry.label} tone={expiry.tone} />
        </View>
      </Card>

      <SectionHeader title="Property and agreement" />
      <Card>
        <View style={screen.detailGrid}>
          <Info label="Agent" value={property.agentName} />
          <Info label="Team" value={helpers.teamById[property.teamId]?.name || property.teamId} />
          <Info label="Property type" value={labelFor(PROPERTY_TYPES, property.propertyType)} />
          <Info label="Market" value={`${property.marketType} | ${property.transactionType}`} />
          <Info label="Price" value={formatMoney(property.price)} />
          <Info label="Area" value={`${property.area} sqm`} />
          <Info label="Source" value={labelFor(UNIT_SOURCES, property.source)} />
          <Info label="Agreement dates" value={`${formatDate(property.agreementStartDate)} to ${formatDate(property.agreementEndDate)}`} />
        </View>
        <Text style={screen.body}>{property.notes}</Text>
      </Card>

      <SectionHeader title="Workflow timeline" subtitle={`${getPhaseProgress(property.currentPhase)}% complete`} />
      <Card>
        <View style={screen.rowBetween}>
          <Text style={screen.title}>{phase.title}</Text>
          <Text style={screen.meta}>{getPhaseProgress(property.currentPhase)}%</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <ProgressBar value={getPhaseProgress(property.currentPhase)} color={phase.color} />
        </View>
        <View style={screen.divider} />
        {(property.phaseHistory || []).map((entry) => (
          <View key={`${entry.phaseId}-${entry.changedAt}`} style={[screen.rowBetween, { marginBottom: 10 }]}>
            <Text style={screen.body}>P{entry.phaseId} {entry.title}</Text>
            <Text style={screen.meta}>{formatDate(entry.changedAt)}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="Commission" />
      <Card>
        <View style={screen.detailGrid}>
          <Info label="Buyer commission" value={formatMoney(commission.buyerCommissionAmount)} />
          <Info label="Seller/rent commission" value={formatMoney(commission.sellerCommissionAmount)} />
          <Info label="Total" value={formatMoney(commission.totalCommission)} />
          <Info label="Status" value={property.status === 'closed' ? 'Confirmed' : 'Potential'} />
        </View>
      </Card>

      <SectionHeader title="Related follow-ups" />
      {relatedTasks.length === 0 ? <EmptyState title="No related tasks" body="No follow-up is linked to this property." /> : null}
      {relatedTasks.map((task) => (
        <Card key={task.id}>
          <View style={screen.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={screen.title}>{task.title}</Text>
              <Text style={screen.meta}>{formatDate(task.dueDate)} | {task.priority}</Text>
            </View>
            <StatusBadge label={task.status} tone={task.status === 'done' ? 'success' : 'info'} />
          </View>
          <Text style={screen.body}>{task.notes}</Text>
        </Card>
      ))}

      <View style={screen.actionRow}>
        <PrimaryButton label="Advance phase" onPress={() => actions.advancePhase(property.id)} disabled={property.status === 'closed'} style={screen.actionFlex} />
        <PrimaryButton label="Close deal" onPress={() => actions.closeDeal(property.id)} tone="danger" disabled={property.status === 'closed'} style={screen.actionFlex} />
      </View>
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
