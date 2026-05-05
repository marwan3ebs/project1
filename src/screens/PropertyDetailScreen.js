import React from 'react';
import { Text, View } from 'react-native';

import {
  AgreementBadge,
  ActionMenu,
  Card,
  EmptyState,
  PhaseBadge,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  StatusBadge,
} from '../components/index.js';
import { canCloseDeal, canDeleteProperty, canEditProperty, isManagerRole } from '../auth/index.js';
import { PROPERTY_TYPES, UNIT_SOURCES } from '../constants/index.js';
import { getAgreementStatus, getPhase, getPhaseProgress } from '../services/crmService.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { formatDate } from '../utils/dateUtils.js';
import { labelFor, screen } from './screenStyles.js';

export function PropertyDetailScreen({ data, helpers, actions, navigate, route, currentUser }) {
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
  const relatedAgreement = (data.agreements || []).find((agreement) => agreement.propertyId === property.id);
  const ownershipHistory = (data.ownershipHistory || []).filter((entry) => entry.entityId === property.id);

  return (
    <View>
      <SectionHeader title={property.title || property.location} subtitle={`${property.agreementCode} | ${property.location}`} actionLabel="Back" onAction={() => navigate('inventory')} />

      <Card>
        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: '#dbe4ef', backgroundColor: '#f8fafc', minHeight: 118, padding: 14, justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={screen.infoLabel}>Property media</Text>
          <Text style={screen.title}>{property.photosCount || 0} photos ready</Text>
          <Text style={screen.meta}>{property.documentsCount || 0} contract/documents | {property.marketingStatus || 'listed'}</Text>
        </View>
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

      <SectionHeader title="Property overview" />
      <Card>
        <View style={screen.detailGrid}>
          <Info label="Agent" value={property.agentName} />
          <Info label="Team" value={helpers.teamById[property.teamId]?.name || property.teamId} />
          <Info label="Property type" value={labelFor(PROPERTY_TYPES, property.propertyType)} />
          <Info label="District" value={property.district || property.location} />
          <Info label="Compound" value={property.compound || 'Not specified'} />
          <Info label="Market" value={`${property.marketType} | ${property.transactionType}`} />
          <Info label="Price" value={formatMoney(property.price)} />
          <Info label="Area" value={`${property.area} sqm`} />
          <Info label="Layout" value={`${property.bedrooms || '-'} bed / ${property.bathrooms || '-'} bath / ${property.floor || '-'}`} />
          <Info label="View / finish" value={`${property.view || 'n/a'} / ${property.finishing || 'n/a'}`} />
          <Info label="Source" value={labelFor(UNIT_SOURCES, property.source)} />
          <Info label="Last activity" value={formatDate(property.lastActivityAt || property.updatedAt)} />
          <Info label="Next follow-up" value={property.nextFollowUpAt ? formatDate(property.nextFollowUpAt) : 'Not scheduled'} />
        </View>
        <Text style={screen.body}>{property.notes}</Text>
      </Card>

      <SectionHeader title="Agreement details" />
      <Card>
        <View style={screen.detailGrid}>
          <Info label="Agreement code" value={property.agreementCode} />
          <Info label="Agreement type" value={property.agreementType} />
          <Info label="Expiry risk" value={expiry.label} />
          <Info label="Agreement dates" value={`${formatDate(property.agreementStartDate)} to ${formatDate(property.agreementEndDate)}`} />
        </View>
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

      <SectionHeader title="Agreement approval" subtitle="Manager/admin approval and override controls" />
      <Card>
        <View style={screen.detailGrid}>
          <Info label="Agreement" value={relatedAgreement?.agreementCode || property.agreementCode} />
          <Info label="Type" value={relatedAgreement?.agreementType || property.agreementType} />
          <Info label="Needs approval" value={relatedAgreement?.requiresApproval ? 'Yes' : 'No'} />
          <Info label="Approved by" value={relatedAgreement?.approvedBy || 'Not approved'} />
        </View>
        <ActionMenu actions={[
          relatedAgreement?.requiresApproval && isManagerRole(currentUser?.role) && {
            label: 'Approve agreement',
            tone: 'primary',
            onPress: () => actions.approveAgreement(relatedAgreement.id),
          },
        ]} />
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

      <SectionHeader title="Ownership history" />
      {ownershipHistory.length === 0 ? <EmptyState title="No ownership changes" body="This property has not been reassigned in the local demo history." /> : null}
      {ownershipHistory.slice(0, 5).map((entry) => (
        <Card key={entry.id}>
          <Text style={screen.title}>{entry.action}</Text>
          <Text style={screen.meta}>{entry.createdAt} | {entry.reason}</Text>
          <Text style={screen.body}>{entry.fromUserId || entry.fromTeamId || 'n/a'} to {entry.toUserId || entry.toTeamId || 'n/a'}</Text>
        </Card>
      ))}

      <SectionHeader title="Client actions" subtitle="Calls, notes, and follow-up scheduling" />
      <Card>
        <ActionMenu actions={[
          canEditProperty(currentUser, property) && { label: 'Add client note', onPress: () => actions.propertyAction(property.id, 'client_note') },
          canEditProperty(currentUser, property) && { label: 'Log call', onPress: () => actions.propertyAction(property.id, 'log_call') },
          canEditProperty(currentUser, property) && { label: 'Schedule follow-up', onPress: () => actions.propertyAction(property.id, 'follow_up') },
        ]} />
      </Card>

      <SectionHeader title="Management actions" subtitle="Local demo actions persisted with AsyncStorage" />
      <Card>
        <ActionMenu actions={[
          canEditProperty(currentUser, property) && { label: 'Advance phase', tone: 'dark', disabled: property.status === 'closed', onPress: () => actions.advancePhase(property.id) },
          canEditProperty(currentUser, property) && { label: 'Move back', onPress: () => actions.propertyAction(property.id, 'move_back') },
          canEditProperty(currentUser, property) && { label: 'Follow-up', onPress: () => actions.propertyAction(property.id, 'follow_up') },
          canEditProperty(currentUser, property) && { label: 'Meeting', onPress: () => actions.propertyAction(property.id, 'meeting') },
          canEditProperty(currentUser, property) && { label: 'Initial preview', onPress: () => actions.propertyAction(property.id, 'buyer_preview') },
          canEditProperty(currentUser, property) && { label: 'Pricing note', onPress: () => actions.propertyAction(property.id, 'pricing_note') },
          canEditProperty(currentUser, property) && { label: 'Negotiation note', onPress: () => actions.propertyAction(property.id, 'negotiation_note') },
          canEditProperty(currentUser, property) && { label: 'Contract check', onPress: () => actions.propertyAction(property.id, 'contract_check') },
          canEditProperty(currentUser, property) && { label: 'Renew 3 months', onPress: () => actions.propertyAction(property.id, 'renew_agreement') },
          canEditProperty(currentUser, property) && { label: 'Mark expired', onPress: () => actions.propertyAction(property.id, 'mark_expired') },
          canEditProperty(currentUser, property) && property.agreementType !== 'exclusive' && { label: 'Make exclusive', onPress: () => actions.propertyAction(property.id, 'upgrade_exclusive') },
          canEditProperty(currentUser, property) && { label: 'Marketing started', onPress: () => actions.propertyAction(property.id, 'marketing_started') },
          canEditProperty(currentUser, property) && { label: 'Buyer preview', onPress: () => actions.propertyAction(property.id, 'buyer_preview') },
          canCloseDeal(currentUser, property) && { label: 'Close deal', tone: 'danger', disabled: property.status === 'closed', onPress: () => actions.closeDeal(property.id) },
          canCloseDeal(currentUser, property) && { label: 'Commission received', tone: 'primary', onPress: () => actions.propertyAction(property.id, 'commission_received') },
          canEditProperty(currentUser, property) && property.status !== 'active' && { label: 'Reopen', onPress: () => actions.propertyAction(property.id, 'reopen') },
          canEditProperty(currentUser, property) && { label: 'Duplicate', onPress: () => actions.propertyAction(property.id, 'duplicate') },
          canEditProperty(currentUser, property) && { label: 'Archive', tone: 'danger', onPress: () => actions.propertyAction(property.id, 'archive') },
          canDeleteProperty(currentUser, property) && { label: 'Delete', tone: 'danger', onPress: () => actions.propertyAction(property.id, 'delete_property') },
        ]} />
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
