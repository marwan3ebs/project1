import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  Card,
  EmptyState,
  FormInput,
  PrimaryButton,
  SectionHeader,
  SelectInput,
  StatusBadge,
} from '../components/index.js';
import { PRIORITIES, TASK_TYPES } from '../constants/index.js';
import { daysFromToday, daysUntil, formatDate } from '../utils/dateUtils.js';
import { screen } from './screenStyles.js';

function emptyTask(data) {
  return {
    title: '',
    type: 'follow_up',
    relatedPropertyId: data.properties[0]?.id || '',
    agentId: data.agents.find((agent) => agent.role === 'agent')?.id || data.agents[0]?.id || '',
    dueDate: daysFromToday(1),
    priority: 'medium',
    notes: '',
  };
}

export function ScheduleScreen({ data, helpers, actions }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => emptyTask(data));
  const openTasks = data.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  const doneTasks = data.tasks.filter((task) => task.status === 'done').slice(0, 5);

  const propertyOptions = data.properties.map((property) => ({
    value: property.id,
    label: property.agreementCode,
  }));
  const agentOptions = data.agents
    .filter((agent) => agent.role !== 'manager')
    .map((agent) => ({ value: agent.id, label: agent.name }));

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!form.title.trim()) {
      Alert.alert('Missing title', 'Add a short task title before saving.');
      return;
    }

    actions.addTask(form);
    setForm(emptyTask(data));
    setShowForm(false);
  }

  return (
    <View>
      <SectionHeader
        title="Schedule"
        subtitle="Meetings, previews, follow-ups, contract checks, and expiry tasks"
        actionLabel={showForm ? 'Close' : 'Add'}
        onAction={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <Card>
          <SelectInput label="Task type" options={TASK_TYPES} value={form.type} onChange={(value) => update('type', value)} />
          <SelectInput label="Agent" options={agentOptions} value={form.agentId} onChange={(value) => update('agentId', value)} />
          <SelectInput label="Property" options={propertyOptions} value={form.relatedPropertyId} onChange={(value) => update('relatedPropertyId', value)} />
          <SelectInput label="Priority" options={PRIORITIES} value={form.priority} onChange={(value) => update('priority', value)} />
          <FormInput label="Title" value={form.title} onChangeText={(value) => update('title', value)} />
          <FormInput label="Due date" value={form.dueDate} onChangeText={(value) => update('dueDate', value)} />
          <FormInput label="Notes" value={form.notes} onChangeText={(value) => update('notes', value)} multiline />
          <PrimaryButton label="Add schedule item" onPress={submit} />
        </Card>
      ) : null}

      <SectionHeader title="Open work" subtitle={`${openTasks.length} active CRM tasks`} />
      {openTasks.length === 0 ? <EmptyState title="Schedule clear" body="No meetings or follow-ups are open." /> : null}
      {openTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          agent={helpers.agentById[task.agentId]}
          property={helpers.propertyById[task.relatedPropertyId]}
          onToggle={() => actions.toggleTask(task.id)}
        />
      ))}

      {doneTasks.length ? <SectionHeader title="Completed recently" /> : null}
      {doneTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          agent={helpers.agentById[task.agentId]}
          property={helpers.propertyById[task.relatedPropertyId]}
          onToggle={() => actions.toggleTask(task.id)}
        />
      ))}
    </View>
  );
}

function TaskCard({ task, agent, property, onToggle }) {
  const late = task.status !== 'done' && daysUntil(task.dueDate) < 0;
  const today = task.status !== 'done' && daysUntil(task.dueDate) === 0;
  const tone = task.status === 'done' ? 'success' : late ? 'danger' : today ? 'warning' : 'info';
  const label = task.status === 'done' ? 'Done' : late ? 'Overdue' : today ? 'Today' : task.priority;

  return (
    <Card>
      <View style={screen.rowBetween}>
        <View style={{ flex: 1 }}>
          <Text style={screen.title}>{task.title}</Text>
          <Text style={screen.meta}>{formatDate(task.dueDate)} | {agent?.name || 'Unassigned'}</Text>
        </View>
        <StatusBadge label={label} tone={tone} />
      </View>
      {property ? (
        <Text style={screen.body}>{property.agreementCode} | {property.customerName} | {property.location}</Text>
      ) : null}
      <Text style={screen.body}>{task.notes}</Text>
      <View style={screen.actionRow}>
        <PrimaryButton label={task.status === 'done' ? 'Reopen' : 'Mark done'} onPress={onToggle} tone="dark" style={screen.actionFlex} />
      </View>
    </Card>
  );
}
