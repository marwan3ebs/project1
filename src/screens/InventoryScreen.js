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
  StatusBadge,
} from '../components/index.js';
import { canCloseDeal, canEditProperty, canViewProperty } from '../auth/index.js';
import { AGREEMENT_TYPES, TRANSACTION_TYPES, UNIT_SOURCES } from '../constants/index.js';
import { WORKFLOW_PHASES } from '../data/workflowPhases.js';
import { getAgreementStatus } from '../services/crmService.js';
import { calculateCommission, formatMoney } from '../utils/commissionUtils.js';
import { filterProperties, sortPropertiesForCrm } from '../utils/filters.js';
import { screen } from './screenStyles.js';

const initialFilters = {
  query: '',
  agentId: 'all',
  agreementType: 'all',
  transactionType: 'all',
  source: 'all',
  currentPhase: 'all',
  expiringSoon: false,
};

export function InventoryScreen({ data, actions, navigate, currentUser, responsive }) {
  const [filters, setFilters] = useState(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const filteredProperties = useMemo(
    () => sortPropertiesForCrm(filterProperties(data.properties, filters)),
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
        </Card>
      ) : null}

      {filteredProperties.length === 0 ? (
        <EmptyState title="No matching inventory" body="Clear filters or add a new property agreement." />
      ) : null}

      {responsive?.isDesktop && filteredProperties.length ? (
        <DataTable
          columns={[
            { key: 'code', label: 'Agreement', flex: 0.9, render: (row) => row.agreementCode },
            { key: 'location', label: 'Location', flex: 1.6, render: (row) => row.location },
            { key: 'agent', label: 'Agent', render: (row) => row.agentName },
            { key: 'customer', label: 'Customer', render: (row) => row.customerName },
            { key: 'price', label: 'Price', render: (row) => formatMoney(row.price) },
            { key: 'phase', label: 'Phase', render: (row) => `P${row.currentPhase}` },
            { key: 'expiry', label: 'Expiry', render: (row) => getAgreementStatus(row).label },
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
  return [
    canView && { label: 'Details', tone: 'primary', onPress: () => navigate('propertyDetail', { propertyId: property.id }) },
    canEdit && { label: 'Advance', tone: 'dark', disabled: property.status === 'closed', onPress: () => actions.advancePhase(property.id) },
    canEdit && { label: 'Follow-up', onPress: () => actions.propertyAction(property.id, 'follow_up') },
    canClose && { label: 'Close', tone: 'danger', disabled: property.status === 'closed', onPress: () => actions.closeDeal(property.id) },
  ];
}

function InventoryCard({ property, currentUser, onView, onAdvance, onClose }) {
  const expiry = getAgreementStatus(property);
  const commission = calculateCommission(property);

  return (
    <Card>
      <View style={screen.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={screen.title}>{property.location}</Text>
          <Text style={screen.meta}>
            {property.agreementCode} | {property.agentName} | {property.area} sqm
          </Text>
        </View>
        <StatusBadge label={property.status === 'closed' ? 'Closed' : 'Active'} tone={property.status === 'closed' ? 'success' : 'primary'} />
      </View>

      <View style={[screen.wrapRow, { marginTop: 10 }]}>
        <AgreementBadge type={property.agreementType} />
        <PhaseBadge phaseId={property.currentPhase} />
        <StatusBadge label={expiry.label} tone={expiry.tone} />
      </View>

      <View style={screen.detailGrid}>
        <Info label="Customer" value={`${property.customerName} (${property.customerType})`} />
        <Info label="Price" value={formatMoney(property.price)} />
        <Info label="Type" value={`${property.marketType} | ${property.transactionType}`} />
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
