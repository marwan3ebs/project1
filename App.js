import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AGREEMENT_TYPES,
  CATEGORIES,
  COMPANY,
  PHASES,
  PURPOSES,
  TASK_TYPES,
  UNIT_SOURCES,
} from './src/constants/index.js';
import {
  Card,
  EmptyState,
  Field,
  MetricCard,
  Pill,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  SegmentedControl,
} from './src/components/index.js';
import { createSeedData } from './src/data/sampleData.js';
import {
  addMonths,
  calculateCommission,
  daysFromToday,
  daysUntil,
  formatDate,
  formatMoney,
  generateAgreementCode,
  getAgreementAlert,
  getBiweeklyWindow,
  getPhase,
  getPurposeLabel,
  getShortAgreementLabel,
  getSourceLabel,
  isBetween,
  summarizeAgent,
} from './src/utils/index.js';

const STORAGE_KEY = 'top-agents-collaboration:v1';

const TABS = [
  { id: 'dashboard', label: 'Home' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'reports', label: 'Reports' },
  { id: 'team', label: 'Team' },
];

const EMPTY_FILTERS = {
  category: 'all',
  purpose: 'all',
  agentId: 'all',
  status: 'active',
};

function createEmptyPropertyForm(data) {
  const today = daysFromToday(0);

  return {
    category: 'resale',
    purpose: 'purchase',
    agreementType: 'exclusive',
    source: 'leads',
    agentId: data.agents[0]?.id || '',
    clientName: '',
    clientPhone: '',
    clientSide: 'seller',
    location: '',
    project: '',
    unitDetails: '',
    price: '',
    area: '',
    signedDate: today,
    startDate: today,
    endDate: addMonths(today, 3),
    buyerCommissionPercent: '2.5',
    sellerCommissionPercent: '2.5',
    rentCommission: '',
    marketingPlan: '',
    nextAction: '',
  };
}

function createEmptyTaskForm(data) {
  return {
    type: 'follow_up',
    title: '',
    agentId: data.agents[0]?.id || '',
    propertyId: data.properties[0]?.id || '',
    dueDate: daysFromToday(1),
    dueTime: '12:00',
    priority: 'medium',
    notes: '',
  };
}

export default function App() {
  const [data, setData] = useState(() => createSeedData());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!mounted) {
          return;
        }

        if (saved) {
          setData(JSON.parse(saved));
        }

        setHydrated(true);
      })
      .catch(() => {
        if (mounted) {
          setHydrated(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, hydrated]);

  const helpers = useMemo(() => {
    const agentById = Object.fromEntries(data.agents.map((agent) => [agent.id, agent]));
    const propertyById = Object.fromEntries(
      data.properties.map((property) => [property.id, property]),
    );
    const teamById = Object.fromEntries(data.teams.map((team) => [team.id, team]));

    return { agentById, propertyById, teamById };
  }, [data]);

  const agreementReminders = useMemo(() => {
    return data.properties
      .filter((property) => property.status !== 'closed')
      .map((property) => ({ property, days: daysUntil(property.endDate) }))
      .filter((item) => item.days !== null && item.days <= 21)
      .sort((a, b) => a.days - b.days);
  }, [data.properties]);

  function addProperty(form) {
    setData((current) => {
      const startDate = form.startDate || daysFromToday(0);
      const property = {
        id: `prop-${Date.now()}`,
        agreementCode: generateAgreementCode(current.properties),
        category: form.category,
        purpose: form.purpose,
        agreementType: form.agreementType,
        source: form.source,
        agentId: form.agentId,
        clientName: form.clientName.trim(),
        clientPhone: form.clientPhone.trim(),
        clientSide: form.clientSide.trim() || 'seller',
        location: form.location.trim(),
        project: form.project.trim(),
        unitDetails: form.unitDetails.trim(),
        price: Number(form.price || 0),
        area: Number(form.area || 0),
        signedDate: form.signedDate || startDate,
        startDate,
        endDate: form.endDate || addMonths(startDate, 3),
        phase: 1,
        status: 'active',
        buyerCommissionPercent: Number(form.buyerCommissionPercent || 0),
        sellerCommissionPercent: Number(form.sellerCommissionPercent || 0),
        rentCommission: Number(form.rentCommission || 0),
        marketingPlan: form.marketingPlan.trim(),
        nextAction: form.nextAction.trim(),
      };

      return {
        ...current,
        properties: [property, ...current.properties],
      };
    });
  }

  function advancePhase(propertyId) {
    setData((current) => ({
      ...current,
      properties: current.properties.map((property) => {
        if (property.id !== propertyId) {
          return property;
        }

        const nextPhase = Math.min(Number(property.phase || 1) + 1, 10);

        return {
          ...property,
          phase: nextPhase,
          status: nextPhase === 10 ? 'closed' : 'active',
          closingDate: nextPhase === 10 ? property.closingDate || daysFromToday(0) : property.closingDate,
        };
      }),
    }));
  }

  function closeDeal(propertyId) {
    setData((current) => ({
      ...current,
      properties: current.properties.map((property) => {
        if (property.id !== propertyId) {
          return property;
        }

        return {
          ...property,
          phase: 10,
          status: 'closed',
          closingDate: property.closingDate || daysFromToday(0),
        };
      }),
    }));
  }

  function addTask(form) {
    setData((current) => ({
      ...current,
      tasks: [
        {
          id: `task-${Date.now()}`,
          type: form.type,
          title: form.title.trim(),
          agentId: form.agentId,
          propertyId: form.propertyId,
          dueDate: form.dueDate,
          dueTime: form.dueTime,
          priority: form.priority,
          notes: form.notes.trim(),
          status: 'open',
        },
        ...current.tasks,
      ],
    }));
  }

  function toggleTask(taskId) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        return {
          ...task,
          status: task.status === 'done' ? 'open' : 'done',
        };
      }),
    }));
  }

  function resetDemoData() {
    Alert.alert('Reset demo data', 'Restore the starter agents, agreements, and tasks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => setData(createSeedData()),
      },
    ]);
  }

  const screenProps = {
    data,
    helpers,
    agreementReminders,
    addProperty,
    addTask,
    advancePhase,
    closeDeal,
    toggleTask,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>TA</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.company}>{COMPANY.legalName}</Text>
            <Text style={styles.appName}>{COMPANY.appName}</Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={resetDemoData} activeOpacity={0.8}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'dashboard' ? <DashboardScreen {...screenProps} /> : null}
          {activeTab === 'inventory' ? <InventoryScreen {...screenProps} /> : null}
          {activeTab === 'schedule' ? <ScheduleScreen {...screenProps} /> : null}
          {activeTab === 'reports' ? <ReportsScreen {...screenProps} /> : null}
          {activeTab === 'team' ? <TeamScreen {...screenProps} /> : null}
        </ScrollView>

        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const active = tab.id === activeTab;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.82}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DashboardScreen({ data, helpers, agreementReminders, advancePhase, closeDeal, toggleTask }) {
  const window = getBiweeklyWindow();
  const activeProperties = data.properties.filter((property) => property.status !== 'closed');
  const closedThisPeriod = data.properties.filter((property) =>
    isBetween(property.closingDate, window.start, window.end),
  );
  const signedThisPeriod = data.properties.filter((property) =>
    isBetween(property.signedDate, window.start, window.end),
  );
  const potentialCommission = activeProperties.reduce(
    (sum, property) => sum + calculateCommission(property),
    0,
  );
  const openTasks = data.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`))
    .slice(0, 4);

  const phaseCounts = PHASES.map((phase) => ({
    ...phase,
    count: activeProperties.filter((property) => Number(property.phase) === phase.id).length,
  }));

  return (
    <View>
      <SectionHeader
        title="Manager dashboard"
        subtitle={`${formatDate(window.start)} to ${formatDate(window.end)}`}
      />

      <View style={styles.metricGrid}>
        <MetricCard label="Active inventory" value={activeProperties.length} detail="Primary and resale" />
        <MetricCard
          label="Signed in 14 days"
          value={signedThisPeriod.length}
          detail="New agreements"
          tone="amber"
        />
        <MetricCard
          label="Closed in 14 days"
          value={closedThisPeriod.length}
          detail="Reached phase 10"
          tone="rose"
        />
        <MetricCard
          label="Potential commission"
          value={formatMoney(potentialCommission)}
          detail="Open pipeline"
          tone="slate"
        />
      </View>

      <SectionHeader title="Today and next actions" subtitle="Meetings, follow ups, and agreement reminders" />
      {openTasks.length === 0 && agreementReminders.length === 0 ? (
        <EmptyState title="No open work" body="The team has no pending reminders in this view." />
      ) : null}

      {agreementReminders.slice(0, 3).map(({ property, days }) => (
        <Card key={`reminder-${property.id}`} style={styles.alertCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{property.agreementCode}</Text>
            <Pill label={days < 0 ? 'Expired' : `${days} days left`} tone={days < 0 ? 'danger' : 'warning'} />
          </View>
          <Text style={styles.cardMeta}>
            {property.clientName} | {property.location}
          </Text>
          <Text style={styles.cardBody}>Agreement ends on {formatDate(property.endDate)}</Text>
        </Card>
      ))}

      {openTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          agent={helpers.agentById[task.agentId]}
          property={helpers.propertyById[task.propertyId]}
          onToggle={() => toggleTask(task.id)}
        />
      ))}

      <SectionHeader title="Pipeline by phase" subtitle="From farming to closing" />
      <Card>
        {phaseCounts.map((phase) => (
          <View key={phase.id} style={styles.phaseRow}>
            <View style={styles.phaseLabelWrap}>
              <Text style={styles.phaseNumber}>{phase.id}</Text>
              <Text style={styles.phaseText}>{phase.short}</Text>
            </View>
            <View style={styles.phaseProgressWrap}>
              <ProgressBar value={(phase.count / Math.max(activeProperties.length, 1)) * 100} color={phase.color} />
            </View>
            <Text style={styles.phaseCount}>{phase.count}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="Highest priority deals" subtitle="Quick pipeline controls" />
      {activeProperties
        .sort((a, b) => Number(b.phase) - Number(a.phase))
        .slice(0, 3)
        .map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            agent={helpers.agentById[property.agentId]}
            onAdvance={() => advancePhase(property.id)}
            onClose={() => closeDeal(property.id)}
          />
        ))}
    </View>
  );
}

function InventoryScreen({ data, helpers, addProperty, advancePhase, closeDeal }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => createEmptyPropertyForm(data));

  const agentOptions = [
    { value: 'all', label: 'All agents' },
    ...data.agents.map((agent) => ({ value: agent.id, label: agent.name.split(' ')[0] })),
  ];

  const filteredProperties = data.properties.filter((property) => {
    const matchesCategory = filters.category === 'all' || property.category === filters.category;
    const matchesPurpose = filters.purpose === 'all' || property.purpose === filters.purpose;
    const matchesAgent = filters.agentId === 'all' || property.agentId === filters.agentId;
    const matchesStatus = filters.status === 'all' || property.status === filters.status;
    return matchesCategory && matchesPurpose && matchesAgent && matchesStatus;
  });

  function updateForm(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === 'purpose' && value === 'rent') {
        next.agreementType = 'rent';
        next.buyerCommissionPercent = '0';
        next.sellerCommissionPercent = '0';
      }

      if (key === 'purpose' && value === 'purchase' && current.agreementType === 'rent') {
        next.agreementType = 'exclusive';
        next.buyerCommissionPercent = '2.5';
        next.sellerCommissionPercent = '2.5';
      }

      if (key === 'startDate') {
        next.endDate = addMonths(value, 3);
      }

      return next;
    });
  }

  function submitForm() {
    if (!form.clientName.trim() || !form.location.trim()) {
      Alert.alert('Missing details', 'Client name and location are required.');
      return;
    }

    addProperty(form);
    setForm(createEmptyPropertyForm(data));
    setShowForm(false);
  }

  return (
    <View>
      <SectionHeader
        title="Inventory"
        subtitle={`${filteredProperties.length} agreements in view`}
        actionLabel={showForm ? 'Close' : 'Add'}
        onAction={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <Card>
          <SegmentedControl
            label="Category"
            options={CATEGORIES}
            value={form.category}
            onChange={(value) => updateForm('category', value)}
          />
          <SegmentedControl
            label="Transaction"
            options={PURPOSES}
            value={form.purpose}
            onChange={(value) => updateForm('purpose', value)}
          />
          <SegmentedControl
            label="Agreement type"
            options={AGREEMENT_TYPES.filter((type) =>
              form.purpose === 'rent' ? type.value === 'rent' : type.value !== 'rent',
            )}
            value={form.agreementType}
            onChange={(value) => updateForm('agreementType', value)}
          />
          <SegmentedControl
            label="Unit source"
            options={UNIT_SOURCES}
            value={form.source}
            onChange={(value) => updateForm('source', value)}
          />
          <SegmentedControl
            label="Agent"
            options={data.agents.map((agent) => ({ value: agent.id, label: agent.name }))}
            value={form.agentId}
            onChange={(value) => updateForm('agentId', value)}
          />
          <Field label="Customer name" value={form.clientName} onChangeText={(value) => updateForm('clientName', value)} />
          <Field
            label="Customer number"
            value={form.clientPhone}
            onChangeText={(value) => updateForm('clientPhone', value)}
            keyboardType="phone-pad"
          />
          <Field label="Customer side" value={form.clientSide} onChangeText={(value) => updateForm('clientSide', value)} />
          <Field label="Location" value={form.location} onChangeText={(value) => updateForm('location', value)} />
          <Field label="Project or building" value={form.project} onChangeText={(value) => updateForm('project', value)} />
          <Field
            label="Apartment description"
            value={form.unitDetails}
            onChangeText={(value) => updateForm('unitDetails', value)}
            multiline
          />
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field
                label={form.purpose === 'rent' ? 'Rent price' : 'Price'}
                value={form.price}
                onChangeText={(value) => updateForm('price', value)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Field label="Area sqm" value={form.area} onChangeText={(value) => updateForm('area', value)} keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field label="Start date" value={form.startDate} onChangeText={(value) => updateForm('startDate', value)} />
            </View>
            <View style={styles.column}>
              <Field label="End date" value={form.endDate} onChangeText={(value) => updateForm('endDate', value)} />
            </View>
          </View>
          {form.purpose === 'purchase' ? (
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Field
                  label="Buyer %"
                  value={form.buyerCommissionPercent}
                  onChangeText={(value) => updateForm('buyerCommissionPercent', value)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.column}>
                <Field
                  label="Seller %"
                  value={form.sellerCommissionPercent}
                  onChangeText={(value) => updateForm('sellerCommissionPercent', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ) : (
            <Field
              label="Rent commission"
              value={form.rentCommission}
              onChangeText={(value) => updateForm('rentCommission', value)}
              keyboardType="numeric"
            />
          )}
          <Field
            label="Marketing plan"
            value={form.marketingPlan}
            onChangeText={(value) => updateForm('marketingPlan', value)}
            multiline
          />
          <Field label="Next action" value={form.nextAction} onChangeText={(value) => updateForm('nextAction', value)} multiline />
          <PrimaryButton label="Create agreement" onPress={submitForm} />
        </Card>
      ) : null}

      <Card>
        <SegmentedControl
          label="Category"
          options={[{ value: 'all', label: 'All' }, ...CATEGORIES]}
          value={filters.category}
          onChange={(value) => setFilters((current) => ({ ...current, category: value }))}
        />
        <SegmentedControl
          label="Transaction"
          options={[{ value: 'all', label: 'All' }, ...PURPOSES]}
          value={filters.purpose}
          onChange={(value) => setFilters((current) => ({ ...current, purpose: value }))}
        />
        <SegmentedControl
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'closed', label: 'Closed' },
            { value: 'all', label: 'All' },
          ]}
          value={filters.status}
          onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
        />
        <SegmentedControl
          label="Agent"
          options={agentOptions}
          value={filters.agentId}
          onChange={(value) => setFilters((current) => ({ ...current, agentId: value }))}
        />
      </Card>

      {filteredProperties.length === 0 ? (
        <EmptyState title="No agreements found" body="Change filters or add a new property agreement." />
      ) : null}

      {filteredProperties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          agent={helpers.agentById[property.agentId]}
          onAdvance={() => advancePhase(property.id)}
          onClose={() => closeDeal(property.id)}
        />
      ))}
    </View>
  );
}

function ScheduleScreen({ data, helpers, agreementReminders, addTask, toggleTask }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => createEmptyTaskForm(data));
  const openTasks = data.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`));
  const doneTasks = data.tasks.filter((task) => task.status === 'done').slice(0, 5);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitForm() {
    if (!form.title.trim()) {
      Alert.alert('Missing title', 'Add a short title for this schedule item.');
      return;
    }

    addTask(form);
    setForm(createEmptyTaskForm(data));
    setShowForm(false);
  }

  return (
    <View>
      <SectionHeader
        title="Agent schedule"
        subtitle="Meetings, previews, follow ups, contracts"
        actionLabel={showForm ? 'Close' : 'Add'}
        onAction={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <Card>
          <SegmentedControl
            label="Task type"
            options={TASK_TYPES}
            value={form.type}
            onChange={(value) => updateForm('type', value)}
          />
          <SegmentedControl
            label="Agent"
            options={data.agents.map((agent) => ({ value: agent.id, label: agent.name }))}
            value={form.agentId}
            onChange={(value) => updateForm('agentId', value)}
          />
          <SegmentedControl
            label="Priority"
            options={[
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            value={form.priority}
            onChange={(value) => updateForm('priority', value)}
          />
          <SegmentedControl
            label="Agreement"
            options={data.properties.map((property) => ({
              value: property.id,
              label: property.agreementCode,
            }))}
            value={form.propertyId}
            onChange={(value) => updateForm('propertyId', value)}
          />
          <Field label="Title" value={form.title} onChangeText={(value) => updateForm('title', value)} />
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field label="Date" value={form.dueDate} onChangeText={(value) => updateForm('dueDate', value)} />
            </View>
            <View style={styles.column}>
              <Field label="Time" value={form.dueTime} onChangeText={(value) => updateForm('dueTime', value)} />
            </View>
          </View>
          <Field label="Notes" value={form.notes} onChangeText={(value) => updateForm('notes', value)} multiline />
          <PrimaryButton label="Add schedule item" onPress={submitForm} />
        </Card>
      ) : null}

      <SectionHeader title="Agreement reminders" subtitle="Seller agreements are tracked for 3 months" />
      {agreementReminders.length === 0 ? (
        <EmptyState title="No agreement deadlines" body="No agreements expire in the next 21 days." />
      ) : (
        agreementReminders.map(({ property, days }) => (
          <Card key={property.id} style={styles.alertCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{property.agreementCode}</Text>
              <Pill label={days < 0 ? `${Math.abs(days)} days late` : `${days} days left`} tone={days < 0 ? 'danger' : 'warning'} />
            </View>
            <Text style={styles.cardMeta}>
              {property.clientName} | {helpers.agentById[property.agentId]?.name}
            </Text>
            <Text style={styles.cardBody}>{property.location}</Text>
          </Card>
        ))
      )}

      <SectionHeader title="Open schedule" subtitle={`${openTasks.length} active items`} />
      {openTasks.length === 0 ? <EmptyState title="Schedule clear" body="No open meetings or follow ups." /> : null}
      {openTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          agent={helpers.agentById[task.agentId]}
          property={helpers.propertyById[task.propertyId]}
          onToggle={() => toggleTask(task.id)}
        />
      ))}

      {doneTasks.length ? <SectionHeader title="Completed recently" /> : null}
      {doneTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          agent={helpers.agentById[task.agentId]}
          property={helpers.propertyById[task.propertyId]}
          onToggle={() => toggleTask(task.id)}
        />
      ))}
    </View>
  );
}

function ReportsScreen({ data, helpers }) {
  const window = getBiweeklyWindow();
  const activeProperties = data.properties.filter((property) => property.status !== 'closed');
  const signedThisPeriod = data.properties.filter((property) =>
    isBetween(property.signedDate, window.start, window.end),
  );
  const closedThisPeriod = data.properties.filter((property) =>
    isBetween(property.closingDate, window.start, window.end),
  );

  const agentRows = data.agents.map((agent) => {
    const signed = signedThisPeriod.filter((property) => property.agentId === agent.id);
    const closed = closedThisPeriod.filter((property) => property.agentId === agent.id);
    const active = activeProperties.filter((property) => property.agentId === agent.id);

    return {
      agent,
      signed: signed.length,
      closed: closed.length,
      active: active.length,
      commission: closed.reduce((sum, property) => sum + calculateCommission(property), 0),
    };
  });

  const phaseRows = PHASES.map((phase) => ({
    ...phase,
    count: data.properties.filter((property) => Number(property.phase) === phase.id).length,
  }));

  return (
    <View>
      <SectionHeader
        title="Biweekly report"
        subtitle={`${formatDate(window.start)} to ${formatDate(window.end)}`}
      />

      <View style={styles.metricGrid}>
        <MetricCard label="Agreements signed" value={signedThisPeriod.length} detail="All agents" />
        <MetricCard label="Deals completed" value={closedThisPeriod.length} detail="Closed phase" tone="rose" />
        <MetricCard
          label="Closed commission"
          value={formatMoney(closedThisPeriod.reduce((sum, property) => sum + calculateCommission(property), 0))}
          detail="Buyer plus seller side"
          tone="amber"
        />
        <MetricCard label="Active pipeline" value={activeProperties.length} detail="Open agreements" tone="slate" />
      </View>

      <SectionHeader title="Agent production" subtitle="Signed agreements and closings" />
      <Card>
        {agentRows.map((row) => (
          <View key={row.agent.id} style={styles.reportRow}>
            <View style={styles.reportAgent}>
              <Text style={styles.reportName}>{row.agent.name}</Text>
              <Text style={styles.reportMeta}>{helpers.teamById[row.agent.leaderId]?.name}</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportNumber}>{row.signed}</Text>
              <Text style={styles.reportLabel}>signed</Text>
            </View>
            <View style={styles.reportStat}>
              <Text style={styles.reportNumber}>{row.closed}</Text>
              <Text style={styles.reportLabel}>closed</Text>
            </View>
            <View style={styles.reportStatWide}>
              <Text style={styles.reportNumber}>{formatMoney(row.commission)}</Text>
              <Text style={styles.reportLabel}>commission</Text>
            </View>
          </View>
        ))}
      </Card>

      <SectionHeader title="Levels to closing" subtitle="Pipeline count by workflow phase" />
      <Card>
        {phaseRows.map((phase) => (
          <View key={phase.id} style={styles.phaseRow}>
            <View style={styles.phaseLabelWrap}>
              <Text style={styles.phaseNumber}>{phase.id}</Text>
              <Text style={styles.phaseText}>{phase.title}</Text>
            </View>
            <View style={styles.phaseProgressWrap}>
              <ProgressBar value={(phase.count / Math.max(data.properties.length, 1)) * 100} color={phase.color} />
            </View>
            <Text style={styles.phaseCount}>{phase.count}</Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="Signed agreements" subtitle="Current report window" />
      {signedThisPeriod.length === 0 ? (
        <EmptyState title="No signed agreements" body="No agreements were signed in the current 14-day period." />
      ) : (
        signedThisPeriod.map((property) => (
          <CompactAgreementRow key={property.id} property={property} agent={helpers.agentById[property.agentId]} />
        ))
      )}
    </View>
  );
}

function TeamScreen({ data, helpers }) {
  const [leaderId, setLeaderId] = useState(data.teams[0]?.id || '');
  const leaderAgents = data.agents.filter((agent) => agent.leaderId === leaderId);
  const teamProperties = data.properties.filter((property) =>
    leaderAgents.some((agent) => agent.id === property.agentId),
  );
  const teamClosed = teamProperties.filter((property) => property.status === 'closed');
  const teamInventory = teamProperties.filter((property) => property.status !== 'closed');

  return (
    <View>
      <SectionHeader title="Team leader view" subtitle="Inventory, deals, and team performance" />
      <SegmentedControl
        label="Team leader"
        options={data.teams.map((team) => ({ value: team.id, label: team.name }))}
        value={leaderId}
        onChange={setLeaderId}
      />

      <View style={styles.metricGrid}>
        <MetricCard label="Team inventory" value={teamInventory.length} detail="Active agreements" />
        <MetricCard label="Closed deals" value={teamClosed.length} detail="All time" tone="rose" />
        <MetricCard
          label="Inventory value"
          value={formatMoney(teamInventory.reduce((sum, property) => sum + Number(property.price || 0), 0))}
          detail="Active listed price"
          tone="amber"
        />
        <MetricCard
          label="Commission closed"
          value={formatMoney(teamClosed.reduce((sum, property) => sum + calculateCommission(property), 0))}
          detail="Buyer plus seller"
          tone="slate"
        />
      </View>

      <SectionHeader title="Agent scorecards" />
      {leaderAgents.map((agent) => {
        const summary = summarizeAgent(agent, data.properties);
        const progress = (summary.inventory / Math.max(agent.target, 1)) * 100;

        return (
          <Card key={agent.id}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardTitle}>{agent.name}</Text>
                <Text style={styles.cardMeta}>{agent.phone}</Text>
              </View>
              <Pill label={`${summary.inventory}/${agent.target} target`} tone={progress >= 100 ? 'green' : 'calm'} />
            </View>
            <View style={styles.agentStats}>
              <View style={styles.agentStatBox}>
                <Text style={styles.agentStatValue}>{summary.inventory}</Text>
                <Text style={styles.agentStatLabel}>inventory</Text>
              </View>
              <View style={styles.agentStatBox}>
                <Text style={styles.agentStatValue}>{summary.exclusive}</Text>
                <Text style={styles.agentStatLabel}>exclusive</Text>
              </View>
              <View style={styles.agentStatBox}>
                <Text style={styles.agentStatValue}>{summary.closed}</Text>
                <Text style={styles.agentStatLabel}>closed</Text>
              </View>
            </View>
            <ProgressBar value={progress} color={progress >= 100 ? '#16a34a' : '#0f766e'} />
            <Text style={styles.cardBody}>
              Active value {formatMoney(summary.inventoryValue)} | Closed commission {formatMoney(summary.commission)}
            </Text>
          </Card>
        );
      })}

      <SectionHeader title="Team agreements" />
      {teamProperties.map((property) => (
        <CompactAgreementRow key={property.id} property={property} agent={helpers.agentById[property.agentId]} />
      ))}
    </View>
  );
}

function PropertyCard({ property, agent, onAdvance, onClose }) {
  const phase = getPhase(property.phase);
  const alert = getAgreementAlert(property);
  const progress = (Number(property.phase || 1) / 10) * 100;

  return (
    <Card>
      <View style={styles.rowBetween}>
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>{property.agreementCode}</Text>
          <Text style={styles.cardMeta}>
            {property.clientName} | {property.clientPhone}
          </Text>
        </View>
        <View style={styles.pillStack}>
          <Pill label={getShortAgreementLabel(property.agreementType)} tone={property.agreementType === 'exclusive' ? 'teal' : 'slate'} />
          {alert ? <Pill label={alert.label} tone={alert.tone} /> : null}
        </View>
      </View>

      <View style={styles.detailGrid}>
        <Info label="Agent" value={agent?.name || 'Unassigned'} />
        <Info label="Category" value={`${property.category} | ${getPurposeLabel(property.purpose)}`} />
        <Info label="Location" value={property.location} />
        <Info label="Project" value={property.project || 'Not set'} />
        <Info label="Price" value={formatMoney(property.price)} />
        <Info label="Area" value={`${property.area || 0} sqm`} />
        <Info label="Source" value={getSourceLabel(property.source)} />
        <Info label="Agreement dates" value={`${formatDate(property.startDate)} to ${formatDate(property.endDate)}`} />
      </View>

      <Text style={styles.cardBody}>{property.unitDetails}</Text>

      <View style={styles.pipelineHeader}>
        <Text style={styles.pipelineText}>
          Phase {phase.id}: {phase.title}
        </Text>
        <Text style={styles.pipelineText}>{Math.round(progress)}%</Text>
      </View>
      <ProgressBar value={progress} color={phase.color} />

      <View style={styles.commissionStrip}>
        <Text style={styles.commissionText}>
          Buyer {property.buyerCommissionPercent || 0}% | Seller {property.sellerCommissionPercent || 0}%
        </Text>
        <Text style={styles.commissionValue}>{formatMoney(calculateCommission(property))}</Text>
      </View>

      {property.nextAction ? <Text style={styles.nextAction}>Next: {property.nextAction}</Text> : null}

      <View style={styles.actionRow}>
        <PrimaryButton label="Advance phase" onPress={onAdvance} disabled={property.status === 'closed'} />
        <PrimaryButton label="Close deal" onPress={onClose} tone="dark" disabled={property.status === 'closed'} />
      </View>
    </Card>
  );
}

function TaskCard({ task, agent, property, onToggle }) {
  const overdue = task.status !== 'done' && daysUntil(task.dueDate) < 0;
  const dueToday = task.status !== 'done' && daysUntil(task.dueDate) === 0;

  return (
    <Card style={task.status === 'done' ? styles.doneCard : undefined}>
      <View style={styles.rowBetween}>
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>{task.title}</Text>
          <Text style={styles.cardMeta}>
            {formatDate(task.dueDate)} at {task.dueTime} | {agent?.name || 'Unassigned'}
          </Text>
        </View>
        <Pill
          label={task.status === 'done' ? 'Done' : overdue ? 'Late' : dueToday ? 'Today' : task.priority}
          tone={task.status === 'done' ? 'green' : overdue ? 'danger' : dueToday ? 'warning' : 'calm'}
        />
      </View>
      {property ? (
        <Text style={styles.cardBody}>
          {property.agreementCode} | {property.clientName} | {property.location}
        </Text>
      ) : null}
      {task.notes ? <Text style={styles.nextAction}>{task.notes}</Text> : null}
      <View style={styles.singleAction}>
        <PrimaryButton label={task.status === 'done' ? 'Reopen' : 'Mark done'} onPress={onToggle} tone="dark" />
      </View>
    </Card>
  );
}

function CompactAgreementRow({ property, agent }) {
  const phase = getPhase(property.phase);

  return (
    <Card>
      <View style={styles.rowBetween}>
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>{property.agreementCode}</Text>
          <Text style={styles.cardMeta}>
            {property.clientName} | {agent?.name || 'Unassigned'}
          </Text>
        </View>
        <Pill label={property.status === 'closed' ? 'Closed' : phase.short} tone={property.status === 'closed' ? 'green' : 'calm'} />
      </View>
      <Text style={styles.cardBody}>
        {property.location} | {getPurposeLabel(property.purpose)} | {formatMoney(property.price)}
      </Text>
    </Card>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#eef4f5',
  },
  keyboard: {
    flex: 1,
  },
  header: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dbe5e7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  headerCopy: {
    flex: 1,
  },
  company: {
    color: '#e11d48',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  appName: {
    color: '#0f172a',
    fontSize: 19,
    fontWeight: '900',
  },
  resetButton: {
    minHeight: 36,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 96,
  },
  tabBar: {
    minHeight: 72,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dbe5e7',
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  tabText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  flexOne: {
    flex: 1,
  },
  cardTitle: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 16,
  },
  cardMeta: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    color: '#334155',
    lineHeight: 20,
    marginTop: 10,
    fontSize: 13,
  },
  alertCard: {
    borderColor: '#fdba74',
    backgroundColor: '#fffaf0',
  },
  pillStack: {
    alignItems: 'flex-end',
    gap: 6,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 34,
  },
  phaseLabelWrap: {
    width: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  phaseNumber: {
    width: 24,
    height: 24,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '900',
  },
  phaseText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  phaseProgressWrap: {
    flex: 1,
  },
  phaseCount: {
    color: '#0f172a',
    width: 24,
    textAlign: 'right',
    fontWeight: '900',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  infoBlock: {
    width: '47%',
    minHeight: 54,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  pipelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 7,
    gap: 10,
  },
  pipelineText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '900',
  },
  commissionStrip: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 11,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  commissionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  commissionValue: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 13,
  },
  nextAction: {
    color: '#0f766e',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  singleAction: {
    marginTop: 12,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  doneCard: {
    opacity: 0.72,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  reportAgent: {
    flex: 1.2,
  },
  reportName: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 13,
  },
  reportMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 3,
  },
  reportStat: {
    width: 54,
    alignItems: 'center',
  },
  reportStatWide: {
    width: 92,
    alignItems: 'flex-end',
  },
  reportNumber: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 14,
  },
  reportLabel: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 10,
    marginTop: 3,
  },
  agentStats: {
    flexDirection: 'row',
    gap: 9,
    marginVertical: 13,
  },
  agentStatBox: {
    flex: 1,
    minHeight: 64,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentStatValue: {
    color: '#0f172a',
    fontSize: 19,
    fontWeight: '900',
  },
  agentStatLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
});
