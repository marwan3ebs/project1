import { WORKFLOW_PHASES } from '../data/workflowPhases.js';
import { addMonths, daysFromToday, daysUntil, normalizeAgreementEndDate } from '../utils/dateUtils.js';
import { buildDealFromProperty } from '../utils/commissionUtils.js';

export function getPhase(phaseId) {
  return WORKFLOW_PHASES.find((phase) => phase.id === Number(phaseId)) || WORKFLOW_PHASES[0];
}

export function getPhaseProgress(phaseId) {
  return Math.round((Number(phaseId || 1) / WORKFLOW_PHASES.length) * 100);
}

export function generateAgreementCode(properties) {
  const year = new Date().getFullYear();
  const maxSequence = properties.reduce((max, property) => {
    const match = String(property.agreementCode || '').match(/TA-\d{4}-(\d+)/);
    return Math.max(max, match ? Number(match[1]) : 100);
  }, 100);
  return `TA-${year}-${String(maxSequence + 1).padStart(3, '0')}`;
}

export function getAgreementStatus(property) {
  if (property.status === 'closed') {
    return { label: 'Closed', tone: 'success', days: null, level: 'closed' };
  }

  const days = daysUntil(property.agreementEndDate);

  if (days === null) {
    return { label: 'No expiry', tone: 'muted', days: null, level: 'none' };
  }

  if (days < 0) {
    return { label: `${Math.abs(days)} days expired`, tone: 'danger', days, level: 'expired' };
  }

  if (days <= 7) {
    return { label: `${days} days left`, tone: 'danger', days, level: '7' };
  }

  if (days <= 14) {
    return { label: `${days} days left`, tone: 'warning', days, level: '14' };
  }

  if (days <= 30) {
    return { label: `${days} days left`, tone: 'info', days, level: '30' };
  }

  return { label: `${days} days left`, tone: 'muted', days, level: 'valid' };
}

export function getAgreementReminders(properties, maxDays = 30) {
  return properties
    .filter((property) => property.status !== 'closed')
    .map((property) => ({ property, status: getAgreementStatus(property) }))
    .filter((item) => item.status.days !== null && item.status.days <= maxDays)
    .sort((a, b) => a.status.days - b.status.days);
}

function getAgent(data, agentId) {
  return data.agents.find((agent) => agent.id === agentId);
}

export function createPropertyFromForm(data, form) {
  const agent = getAgent(data, form.agentId);
  const startDate = form.agreementStartDate || daysFromToday(0);
  const agreementEndDate =
    form.agreementEndDate ||
    normalizeAgreementEndDate({
      agreementType: form.agreementType,
      agreementStartDate: startDate,
    }) ||
    addMonths(startDate, 3);

  const property = {
    id: `prop-${Date.now()}`,
    agentId: form.agentId,
    agentName: agent?.name || 'Unassigned',
    teamId: agent?.teamId || '',
    customerName: String(form.customerName || '').trim(),
    customerPhone: String(form.customerPhone || '').trim(),
    customerType: form.customerType,
    location: String(form.location || '').trim(),
    area: Number(form.area || 0),
    price: Number(form.price || 0),
    propertyType: form.propertyType,
    transactionType: form.transactionType,
    marketType: form.marketType,
    agreementCode: form.agreementCode || generateAgreementCode(data.properties),
    agreementType: form.transactionType === 'rent' ? 'rent' : form.agreementType,
    agreementStartDate: startDate,
    agreementEndDate,
    source: form.source,
    currentPhase: 1,
    phaseHistory: [
      {
        phaseId: 1,
        title: getPhase(1).title,
        changedAt: daysFromToday(0),
      },
    ],
    notes: String(form.notes || '').trim(),
    buyerCommissionPercent: Number(form.buyerCommissionPercent || 2.5),
    sellerCommissionPercent: Number(form.sellerCommissionPercent || 2.5),
    rentCommission: Number(form.rentCommission || 0),
    status: 'active',
    closedAt: null,
    createdAt: daysFromToday(0),
    updatedAt: daysFromToday(0),
  };

  return property;
}

export function addProperty(data, form) {
  const property = createPropertyFromForm(data, form);
  const deal = buildDealFromProperty(property, 'potential');

  return {
    ...data,
    properties: [property, ...data.properties],
    deals: [deal, ...(data.deals || [])],
  };
}

export function advancePropertyPhase(data, propertyId) {
  return {
    ...data,
    properties: data.properties.map((property) => {
      if (property.id !== propertyId || property.status === 'closed') {
        return property;
      }

      const nextPhase = Math.min(Number(property.currentPhase || 1) + 1, WORKFLOW_PHASES.length);
      const next = {
        ...property,
        currentPhase: nextPhase,
        phaseHistory: [
          ...(property.phaseHistory || []),
          { phaseId: nextPhase, title: getPhase(nextPhase).title, changedAt: daysFromToday(0) },
        ],
        status: nextPhase === WORKFLOW_PHASES.length ? 'closed' : property.status,
        closedAt: nextPhase === WORKFLOW_PHASES.length ? daysFromToday(0) : property.closedAt,
        updatedAt: daysFromToday(0),
      };

      return next;
    }),
  };
}

export function closePropertyDeal(data, propertyId) {
  const closedProperties = data.properties.map((property) => {
    if (property.id !== propertyId) {
      return property;
    }

    const hasClosing = (property.phaseHistory || []).some(
      (entry) => Number(entry.phaseId) === WORKFLOW_PHASES.length,
    );

    return {
      ...property,
      currentPhase: WORKFLOW_PHASES.length,
      status: 'closed',
      closedAt: property.closedAt || daysFromToday(0),
      updatedAt: daysFromToday(0),
      phaseHistory: hasClosing
        ? property.phaseHistory
        : [
            ...(property.phaseHistory || []),
            {
              phaseId: WORKFLOW_PHASES.length,
              title: getPhase(WORKFLOW_PHASES.length).title,
              changedAt: daysFromToday(0),
            },
          ],
    };
  });

  return {
    ...data,
    properties: closedProperties,
    deals: closedProperties.map((property) =>
      buildDealFromProperty(property, property.status === 'closed' ? 'confirmed' : 'potential'),
    ),
  };
}

export function addTask(data, form) {
  return {
    ...data,
    tasks: [
      {
        id: `task-${Date.now()}`,
        title: String(form.title || '').trim(),
        type: form.type,
        relatedPropertyId: form.relatedPropertyId,
        agentId: form.agentId,
        dueDate: form.dueDate || daysFromToday(1),
        priority: form.priority,
        status: 'open',
        notes: String(form.notes || '').trim(),
      },
      ...data.tasks,
    ],
  };
}

export function toggleTaskStatus(data, taskId) {
  return {
    ...data,
    tasks: data.tasks.map((task) =>
      task.id === taskId ? { ...task, status: task.status === 'done' ? 'open' : 'done' } : task,
    ),
  };
}

export function getDashboardSummary(data) {
  const activeProperties = data.properties.filter((property) => property.status !== 'closed');
  const closedProperties = data.properties.filter((property) => property.status === 'closed');
  const reminders = getAgreementReminders(data.properties, 30);
  const today = daysFromToday(0);
  const todayTasks = data.tasks.filter((task) => task.status !== 'done' && task.dueDate <= today);

  return {
    activeInventory: activeProperties.length,
    signedAgreements: data.properties.length,
    closedDeals: closedProperties.length,
    agreementsEndingSoon: reminders.length,
    todayTasks: todayTasks.length,
  };
}
