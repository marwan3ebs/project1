import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AgreementBadge,
  ActionMenu,
  Card,
  DataTable,
  EmptyState,
  FilterChip,
  PhaseBadge,
  PrimaryButton,
  SearchBar,
  SectionHeader,
  SelectInput,
  StatusBadge,
} from '../components/index.js';
import { canCloseDeal, canDeleteProperty, canEditProperty, canViewProperty } from '../auth/index.js';
import { AGREEMENT_TYPES, MARKET_TYPES, PROPERTY_TYPES, TRANSACTION_TYPES, UNIT_SOURCES } from '../constants/index.js';
import { WORKFLOW_PHASES } from '../data/workflowPhases.js';
import { getAgreementStatus } from '../services/crmService.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { formatDate } from '../utils/dateUtils.js';
import { filterProperties, sortPropertiesForCrm } from '../utils/filters.js';
import { labelFor, screen } from './screenStyles.js';

const initialFilters = {
  query: '',
  agentId: 'all',
  teamId: 'all',
  location: 'all',
  agreementType: 'all',
  transactionType: 'all',
  marketType: 'all',
  source: 'all',
  currentPhase: 'all',
  status: 'all',
  expiringSoon: false,
  sortBy: 'expiring_soon',
};

export function InventoryScreen({ data, actions, navigate, currentUser, responsive }) {
  const [filters, setFilters] = useState(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const agentById = useMemo(() => Object.fromEntries(data.agents.map((agent) => [agent.id, agent])), [data.agents]);
  const teamById = useMemo(() => Object.fromEntries(data.teams.map((team) => [team.id, team])), [data.teams]);
  const locations = useMemo(
    () => [...new Set(data.properties.map((property) => property.district || property.location).filter(Boolean))],
    [data.properties],
  );

  const filteredProperties = useMemo(
    () => sortPropertiesForCrm(filterProperties(data.properties, filters), filters.sortBy),
    [data.properties, filters],
  );

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <View>
      <SectionHeader
        title="Inventory"
        subtitle={`${filteredProperties.length} units and agreements in view`}
        actionLabel="Add"
        onAction={() => navigate('addProperty')}
      />

      <SearchBar
        value={filters.query}
        onChangeText={(value) => updateFilter('query', value)}
        placeholder="Search code, customer, phone, location, agent"
      />

      <View style={screen.wrapRow}>
        <FilterChip label="All" active={!filters.expiringSoon && filters.agreementType === 'all'} onPress={() => setFilters(initialFilters)} />
        <FilterChip label="Expiring soon" active={filters.expiringSoon} onPress={() => updateFilter('expiringSoon', !filters.expiringSoon)} />
        <FilterChip label="Exclusive" active={filters.agreementType === 'exclusive'} onPress={() => updateFilter('agreementType', filters.agreementType === 'exclusive' ? 'all' : 'exclusive')} />
        <FilterChip label="Rent" active={filters.transactionType === 'rent'} onPress={() => updateFilter('transactionType', filters.transactionType === 'rent' ? 'all' : 'rent')} />
        <FilterChip label="More filters" active={advancedOpen} onPress={() => setAdvancedOpen((value) => !value)} />
      </View>

      {advancedOpen ? (
        <Card style={{ marginTop: 10 }}>
          <Text style={screen.title}>Agent</Text>
          <View style={[screen.wrapRow, { marginTop: 8 }]}>
            <FilterChip label="All agents" active={filters.agentId === 'all'} onPress={() => updateFilter('agentId', 'all')} />
            {data.agents.filter((agent) => agent.role !== 'manager').map((agent) => (
              <FilterChip
                key={agent.id}
                label={agent.name.split(' ')[0]}
                active={filters.agentId === agent.id}
                onPress={() => updateFilter('agentId', filters.agentId === agent.id ? 'all' : agent.id)}
              />
            ))}
          </View>
          <View style={screen.divider} />
          <Text style={screen.title}>Team, market, and location</Text>
          <View style={[screen.wrapRow, { marginTop: 8 }]}>
            <FilterChip label="All teams" active={filters.teamId === 'all'} onPress={() => updateFilter('teamId', 'all')} />
            {data.teams.map((team) => (
              <FilterChip
                key={team.id}
                label={team.name.replace(' Cairo Team', '')}
                active={filters.teamId === team.id}
                onPress={() => updateFilter('teamId', filters.teamId === team.id ? 'all' : team.id)}
              />
            ))}
            {MARKET_TYPES.map((type) => (
              <FilterChip
                key={type.value}
                label={type.label}
                active={filters.marketType === type.value}
                onPress={() => updateFilter('marketType', filters.marketType === type.value ? 'all' : type.value)}
              />
            ))}
            {locations.map((location) => (
              <FilterChip
                key={location}
                label={location}
                active={filters.location === location}
                onPress={() => updateFilter('location', filters.location === location ? 'all' : location)}
              />
            ))}
          </View>
          <View style={screen.divider} />
          <Text style={screen.title}>Agreement and source</Text>
          <View style={[screen.wrapRow, { marginTop: 8 }]}>
            {AGREEMENT_TYPES.map((type) => (
              <FilterChip
                key={type.value}
                label={type.label}
                active={filters.agreementType === type.value}
                onPress={() => updateFilter('agreementType', filters.agreementType === type.value ? 'all' : type.value)}
              />
            ))}
            {TRANSACTION_TYPES.map((type) => (
              <FilterChip
                key={type.value}
                label={type.label}
                active={filters.transactionType === type.value}
                onPress={() => updateFilter('transactionType', filters.transactionType === type.value ? 'all' : type.value)}
              />
            ))}
            {UNIT_SOURCES.map((source) => (
              <FilterChip
                key={source.value}
                label={source.label}
                active={filters.source === source.value}
                onPress={() => updateFilter('source', filters.source === source.value ? 'all' : source.value)}
              />
            ))}
          </View>
          <View style={screen.divider} />
          <Text style={screen.title}>Workflow phase</Text>
          <View style={[screen.wrapRow, { marginTop: 8 }]}>
            <FilterChip
              label="All phases"
              active={filters.currentPhase === 'all'}
              onPress={() => updateFilter('currentPhase', 'all')}
            />
            {WORKFLOW_PHASES.map((phase) => (
              <FilterChip
                key={phase.id}
                label={`P${phase.id}`}
                active={Number(filters.currentPhase) === phase.id}
                onPress={() =>
                  updateFilter('currentPhase', Number(filters.currentPhase) === phase.id ? 'all' : phase.id)
                }
              />
            ))}
          </View>
          <View style={screen.divider} />
          <View style={screen.actionRow}>
            <View style={screen.actionFlex}>
              <SelectInput
                label="Status"
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'closed', label: 'Closed' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={filters.status}
                onChange={(value) => updateFilter('status', value)}
              />
            </View>
            <View style={screen.actionFlex}>
              <SelectInput
                label="Sort"
                options={[
                  { value: 'expiring_soon', label: 'Expiring soon' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'highest_price', label: 'Highest price' },
                  { value: 'highest_commission', label: 'Highest commission' },
                  { value: 'latest_activity', label: 'Latest activity' },
                ]}
                value={filters.sortBy}
                onChange={(value) => updateFilter('sortBy', value)}
              />
            </View>
          </View>
        </Card>
      ) : null}

      {filteredProperties.length === 0 ? (
        <EmptyState title="No matching inventory" body="Clear filters or add a new property agreement." />
      ) : null}

      {responsive?.isDesktop && filteredProperties.length ? (
        <DataTable
          columns={[
            { key: 'code', label: 'Agreement', flex: 0.9, render: (row) => row.agreementCode },
            { key: 'property', label: 'Property', flex: 1.4, render: (row) => row.title || row.location },
            { key: 'location', label: 'Location', flex: 1.2, render: (row) => row.compound || row.district || row.location },
            { key: 'customer', label: 'Owner/client', render: (row) => row.customerName },
            { key: 'agent', label: 'Agent', render: (row) => agentById[row.ownerAgentId]?.name || row.agentName },
            { key: 'team', label: 'Team', render: (row) => teamById[row.teamId]?.name?.replace(' Cairo Team', '') || row.teamId },
            { key: 'price', label: 'Price', render: (row) => formatMoney(row.price) },
            { key: 'type', label: 'Type', render: (row) => `${row.marketType}/${row.transactionType}` },
            { key: 'agreement', label: 'Agreement', render: (row) => row.agreementType },
            { key: 'phase', label: 'Phase', render: (row) => `P${row.currentPhase}` },
            { key: 'expiry', label: 'Expiry', render: (row) => getAgreementStatus(row).label },
            { key: 'commission', label: 'Commission', render: (row) => formatMoney(calculateCommission(row).totalCommission) },
            { key: 'activity', label: 'Last activity', render: (row) => formatDate(row.lastActivityAt || row.updatedAt) },
          ]}
          rows={filteredProperties}
          keyExtractor={(row) => row.id}
          renderActions={(property) => (
            <ActionMenu compact actions={buildPropertyActions({ property, currentUser, actions, navigate })} />
          )}
        />
      ) : (
        filteredProperties.map((property) => (
          <InventoryCard
            key={property.id}
            property={property}
            currentUser={currentUser}
            team={teamById[property.teamId]}
            onView={() => navigate('propertyDetail', { propertyId: property.id })}
            onAdvance={() => actions.advancePhase(property.id)}
            onClose={() => actions.closeDeal(property.id)}
          />
        ))
      )}
    </View>
  );
}

function buildPropertyActions({ property, currentUser, actions, navigate }) {
  const canView = canViewProperty(currentUser, property);
  const canEdit = canEditProperty(currentUser, property);
  const canClose = canCloseDeal(currentUser, property);
  const canDelete = canDeleteProperty(currentUser, property);
  return [
    canView && { label: 'Details', tone: 'primary', onPress: () => navigate('propertyDetail', { propertyId: property.id }) },
    canEdit && { label: 'Edit property', onPress: () => navigate('propertyDetail', { propertyId: property.id }) },
    canEdit && { label: 'Schedule meeting', onPress: () => actions.propertyAction(property.id, 'meeting') },
    canEdit && { label: 'Schedule preview', onPress: () => actions.propertyAction(property.id, 'buyer_preview') },
    canEdit && { label: 'Negotiation note', onPress: () => actions.propertyAction(property.id, 'negotiation_note') },
    canEdit && { label: 'Pricing note', onPress: () => actions.propertyAction(property.id, 'pricing_note') },
    canEdit && { label: 'Contract check', onPress: () => actions.propertyAction(property.id, 'contract_check') },
    canEdit && { label: 'Start marketing', onPress: () => actions.propertyAction(property.id, 'marketing_started') },
    canEdit && property.agreementType !== 'exclusive' && { label: 'Upgrade exclusive', onPress: () => actions.propertyAction(property.id, 'upgrade_exclusive') },
    canEdit && { label: 'Renew 3 months', onPress: () => actions.propertyAction(property.id, 'renew_agreement') },
    canEdit && { label: 'Mark expired', onPress: () => actions.propertyAction(property.id, 'mark_expired') },
    canEdit && { label: 'Advance', tone: 'dark', disabled: property.status === 'closed', onPress: () => actions.advancePhase(property.id) },
    canEdit && { label: 'Move back', onPress: () => actions.propertyAction(property.id, 'move_back') },
    canEdit && { label: 'Follow-up', onPress: () => actions.propertyAction(property.id, 'follow_up') },
    canClose && { label: 'Close', tone: 'danger', disabled: property.status === 'closed', onPress: () => actions.closeDeal(property.id) },
    canClose && { label: 'Commission received', tone: 'primary', onPress: () => actions.propertyAction(property.id, 'commission_received') },
    canEdit && property.status !== 'active' && { label: 'Reopen', onPress: () => actions.propertyAction(property.id, 'reopen') },
    canEdit && { label: 'Archive', tone: 'danger', onPress: () => actions.propertyAction(property.id, 'archive') },
    canDelete && { label: 'Delete', tone: 'danger', onPress: () => actions.propertyAction(property.id, 'delete_property') },
  ];
}

function InventoryCard({ property, currentUser, team, onView, onAdvance, onClose }) {
  const expiry = getAgreementStatus(property);
  const commission = calculateCommission(property);

  return (
    <Card>
      <View style={screen.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={screen.title}>{property.title || property.location}</Text>
          <Text style={screen.meta}>
            {property.agreementCode} | {property.compound || property.district || property.location} | {property.area} sqm
          </Text>
        </View>
        <StatusBadge label={property.status === 'closed' ? 'Closed' : 'Active'} tone={property.status === 'closed' ? 'success' : 'primary'} />
      </View>

      <View style={{ marginTop: 12, borderRadius: 8, borderWidth: 1, borderColor: '#dbe4ef', backgroundColor: '#f8fafc', padding: 12 }}>
        <Text style={screen.infoLabel}>Media and documents</Text>
        <Text style={screen.infoValue}>{property.photosCount || 0} photos | {property.documentsCount || 0} documents | {property.marketingStatus || 'listed'}</Text>
      </View>

      <View style={[screen.wrapRow, { marginTop: 10 }]}>
        <AgreementBadge type={property.agreementType} />
        <PhaseBadge phaseId={property.currentPhase} />
        <StatusBadge label={expiry.label} tone={expiry.tone} />
      </View>

      <View style={screen.detailGrid}>
        <Info label="Customer" value={`${property.customerName} (${property.customerType})`} />
        <Info label="Agent / team" value={`${property.agentName} / ${team?.name || property.teamId}`} />
        <Info label="Price" value={formatMoney(property.price)} />
        <Info label="Type" value={`${labelFor(PROPERTY_TYPES, property.propertyType)} | ${property.marketType} | ${property.transactionType}`} />
        <Info label="Layout" value={`${property.bedrooms || '-'} bed / ${property.bathrooms || '-'} bath / ${property.floor || '-'}`} />
        <Info label="Next follow-up" value={property.nextFollowUpAt ? formatDate(property.nextFollowUpAt) : 'Not scheduled'} />
        <Info label="Commission" value={formatMoney(commission.totalCommission)} />
      </View>

      <Text style={screen.body}>{property.notes}</Text>

      <ActionMenu actions={[
        canViewProperty(currentUser, property) && { label: 'View details', tone: 'primary', onPress: onView },
        canEditProperty(currentUser, property) && { label: 'Advance', tone: 'dark', onPress: onAdvance, disabled: property.status === 'closed' },
        canCloseDeal(currentUser, property) && { label: 'Close', tone: 'danger', onPress: onClose, disabled: property.status === 'closed' },
      ]} />
    </Card>
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
