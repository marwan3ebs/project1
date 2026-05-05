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
    ownerAgentId: form.agentId,
    agentName: agent?.name || 'Unassigned',
    teamId: agent?.teamId || '',
    clientId: `client-prop-${Date.now()}`,
    createdBy: form.createdBy || form.agentId,
    updatedBy: form.createdBy || form.agentId,
    customerName: String(form.customerName || '').trim(),
    customerPhone: String(form.customerPhone || '').trim(),
    customerType: form.customerType,
    location: String(form.location || '').trim(),
    district: String(form.district || form.location || '').trim(),
    compound: String(form.compound || '').trim(),
    area: Number(form.area || 0),
    price: Number(form.price || 0),
    propertyType: form.propertyType,
    title: String(form.title || `${form.propertyType || 'Property'} in ${form.location || 'Egypt'}`).trim(),
    bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
    floor: String(form.floor || '').trim(),
    view: String(form.view || '').trim(),
    finishing: String(form.finishing || '').trim(),
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
    marketingStatus: form.agreementType === 'exclusive' ? 'sponsored' : 'listed',
    photosCount: Number(form.photosCount || 0),
    documentsCount: Number(form.documentsCount || 0),
    attachmentsCount: Number(form.documentsCount || 0),
    lastActivityAt: daysFromToday(0),
    nextFollowUpAt: form.nextFollowUpAt || daysFromToday(2),
    closedAt: null,
    createdAt: daysFromToday(0),
    updatedAt: daysFromToday(0),
  };

  return property;
}

export function addProperty(data, form) {
  const property = createPropertyFromForm(data, form);
  const deal = buildDealFromProperty(property, 'potential');
  const client = {
    id: property.clientId,
    name: property.customerName,
    phone: property.customerPhone,
    type: property.customerType,
    ownerAgentId: property.ownerAgentId,
    agentId: property.agentId,
    teamId: property.teamId,
    propertyIds: [property.id],
    notes: property.notes,
    status: 'active',
    createdBy: property.createdBy,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
  const agreement = {
    id: `agreement-${property.id}`,
    propertyId: property.id,
    agreementCode: property.agreementCode,
    agreementType: property.agreementType,
    transactionType: property.transactionType,
    ownerAgentId: property.ownerAgentId,
    agentId: property.agentId,
    teamId: property.teamId,
    startDate: property.agreementStartDate,
    endDate: property.agreementEndDate,
    status: 'active',
    requiresApproval: property.agreementType === 'exclusive' && property.price > 10000000,
    approvedBy: property.agreementType === 'exclusive' && property.price <= 10000000 ? property.createdBy : null,
    approvedAt: property.agreementType === 'exclusive' && property.price <= 10000000 ? daysFromToday(0) : null,
    createdBy: property.createdBy,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };

  return {
    ...data,
    properties: [property, ...data.properties],
    clients: [client, ...(data.clients || [])],
    agreements: [agreement, ...(data.agreements || [])],
    deals: [deal, ...(data.deals || [])],
  };
}

export function advancePropertyPhase(data, propertyId) {
  const properties = data.properties.map((property) => {
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
    });

  return {
    ...data,
    properties,
    deals: properties.map((property) =>
      buildDealFromProperty(property, property.status === 'closed' ? 'confirmed' : 'potential'),
    ),
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
    agreements: (data.agreements || []).map((agreement) =>
      agreement.propertyId === propertyId
        ? { ...agreement, status: 'completed', updatedAt: daysFromToday(0) }
        : agreement,
    ),
    deals: closedProperties.map((property) =>
      buildDealFromProperty(property, property.status === 'closed' ? 'confirmed' : 'potential'),
    ),
  };
}

function syncDeals(data, properties) {
  return {
    ...data,
    properties,
    deals: properties.map((property) =>
      buildDealFromProperty(property, property.status === 'closed' ? 'confirmed' : 'potential'),
    ),
  };
}

export function movePropertyPhaseBack(data, propertyId, reason = 'Manager review') {
  const properties = data.properties.map((property) => {
    if (property.id !== propertyId || property.status === 'closed') {
      return property;
    }
    const previousPhase = Math.max(Number(property.currentPhase || 1) - 1, 1);
    return {
      ...property,
      currentPhase: previousPhase,
      updatedAt: daysFromToday(0),
      phaseHistory: [
        ...(property.phaseHistory || []),
        { phaseId: previousPhase, title: `Moved back: ${getPhase(previousPhase).title}`, changedAt: daysFromToday(0), reason },
      ],
    };
  });
  return syncDeals(data, properties);
}

export function renewAgreement(data, propertyId) {
  return syncDeals(
    data,
    data.properties.map((property) =>
      property.id === propertyId
        ? {
            ...property,
            agreementStartDate: daysFromToday(0),
            agreementEndDate: addMonths(daysFromToday(0), 3),
            agreementStatus: 'renewed',
            updatedAt: daysFromToday(0),
            notes: `${property.notes || ''}\nAgreement renewed for 3 months.`.trim(),
          }
        : property,
    ),
  );
}

export function upgradeAgreementToExclusive(data, propertyId) {
  return syncDeals(
    data,
    data.properties.map((property) =>
      property.id === propertyId
        ? {
            ...property,
            agreementType: 'exclusive',
            updatedAt: daysFromToday(0),
            notes: `${property.notes || ''}\nAgreement upgraded to exclusive.`.trim(),
          }
        : property,
    ),
  );
}

export function changePropertyStatus(data, propertyId, status) {
  return syncDeals(
    data,
    data.properties.map((property) =>
      property.id === propertyId
        ? {
            ...property,
            status,
            closedAt: status === 'closed' ? property.closedAt || daysFromToday(0) : property.closedAt,
            updatedAt: daysFromToday(0),
          }
        : property,
    ),
  );
}

export function deleteProperty(data, propertyId) {
  const property = data.properties.find((item) => item.id === propertyId);
  return {
    ...data,
    properties: data.properties.filter((item) => item.id !== propertyId),
    agreements: (data.agreements || []).filter((agreement) => agreement.propertyId !== propertyId),
    deals: (data.deals || []).filter((deal) => deal.propertyId !== propertyId),
    tasks: (data.tasks || []).filter((task) => task.relatedPropertyId !== propertyId),
    clients: (data.clients || []).filter((client) => client.id !== property?.clientId),
  };
}

export function approveAgreement(data, agreementId, user) {
  return {
    ...data,
    agreements: (data.agreements || []).map((agreement) =>
      agreement.id === agreementId
        ? {
            ...agreement,
            requiresApproval: false,
            approvedBy: user?.id || 'manager',
            approvedAt: daysFromToday(0),
            updatedAt: daysFromToday(0),
          }
        : agreement,
    ),
  };
}

export function reassignProperty(data, propertyId, agentId) {
  const agent = getAgent(data, agentId);
  return syncDeals(
    {
      ...data,
      agreements: (data.agreements || []).map((agreement) =>
        agreement.propertyId === propertyId && agent
          ? { ...agreement, agentId: agent.id, ownerAgentId: agent.id, teamId: agent.teamId, updatedAt: daysFromToday(0) }
          : agreement,
      ),
    },
    data.properties.map((property) =>
      property.id === propertyId && agent
        ? {
            ...property,
            agentId: agent.id,
            ownerAgentId: agent.id,
            agentName: agent.name,
            teamId: agent.teamId,
            updatedAt: daysFromToday(0),
          }
        : property,
    ),
  );
}

export function duplicateProperty(data, propertyId) {
  const source = data.properties.find((property) => property.id === propertyId);
  if (!source) {
    return data;
  }
  const copy = {
    ...source,
    id: `prop-${Date.now()}`,
    agreementCode: generateAgreementCode(data.properties),
    status: 'active',
    closedAt: null,
    currentPhase: 1,
    phaseHistory: [{ phaseId: 1, title: getPhase(1).title, changedAt: daysFromToday(0) }],
    notes: `${source.notes || ''}\nDuplicated for a similar client/property workflow.`.trim(),
    createdAt: daysFromToday(0),
    updatedAt: daysFromToday(0),
  };
  return {
    ...data,
    properties: [copy, ...data.properties],
    deals: [buildDealFromProperty(copy, 'potential'), ...(data.deals || [])],
  };
}

export function addInternalNote(data, propertyId, note = 'Internal CRM note added.') {
  return {
    ...data,
    properties: data.properties.map((property) =>
      property.id === propertyId
        ? { ...property, notes: `${property.notes || ''}\n${note}`.trim(), updatedAt: daysFromToday(0) }
        : property,
    ),
  };
}

export function markCommissionReceived(data, propertyId) {
  const closed = closePropertyDeal(data, propertyId);
  return {
    ...closed,
    deals: (closed.deals || []).map((deal) =>
      deal.propertyId === propertyId
        ? { ...deal, status: 'confirmed', commissionReceivedAt: daysFromToday(0) }
        : deal,
    ),
  };
}

export function runPropertyAction(data, propertyId, actionType, payload = {}) {
  const property = data.properties.find((item) => item.id === propertyId);
  switch (actionType) {
    case 'move_back':
      return movePropertyPhaseBack(data, propertyId, payload.reason);
    case 'renew_agreement':
      return renewAgreement(data, propertyId);
    case 'upgrade_exclusive':
      return upgradeAgreementToExclusive(data, propertyId);
    case 'archive':
      return changePropertyStatus(data, propertyId, 'archived');
    case 'pause':
      return changePropertyStatus(data, propertyId, 'paused');
    case 'reopen':
      return changePropertyStatus(data, propertyId, 'active');
    case 'duplicate':
      return duplicateProperty(data, propertyId);
    case 'marketing_started':
      return addInternalNote(data, propertyId, 'Marketing started and ads status reviewed.');
    case 'pricing_note':
      return addInternalNote(data, propertyId, payload.note || 'Pricing note added for seller negotiation.');
    case 'negotiation_note':
      return addInternalNote(data, propertyId, payload.note || 'Negotiation note added.');
    case 'client_note':
      return addInternalNote(data, propertyId, payload.note || 'Client note added after direct contact.');
    case 'log_call':
      return addInternalNote(data, propertyId, payload.note || 'Client call logged in CRM.');
    case 'mark_expired':
      return changePropertyStatus(data, propertyId, 'expired');
    case 'buyer_preview':
      return addTask(data, {
        title: 'Buyer preview scheduled',
        type: 'initial_preview',
        relatedPropertyId: propertyId,
        agentId: property?.agentId,
        dueDate: daysFromToday(1),
        priority: 'medium',
        notes: 'Buyer preview created from property action menu.',
      });
    case 'follow_up':
      return addTask(data, {
        title: 'Client follow-up',
        type: 'follow_up',
        relatedPropertyId: propertyId,
        agentId: property?.agentId,
        dueDate: daysFromToday(1),
        priority: 'medium',
        notes: 'Follow-up created from property action menu.',
      });
    case 'meeting':
      return addTask(data, {
        title: 'Negotiation meeting',
        type: 'meeting',
        relatedPropertyId: propertyId,
        agentId: property?.agentId,
        dueDate: daysFromToday(2),
        priority: 'high',
        notes: 'Meeting created from property action menu.',
      });
    case 'contract_check':
      return addTask(data, {
        title: 'Contract check task',
        type: 'contract_check',
        relatedPropertyId: propertyId,
        agentId: property?.agentId,
        dueDate: daysFromToday(2),
        priority: 'high',
        notes: 'Contract check created from property action menu.',
      });
    case 'commission_received':
      return markCommissionReceived(data, propertyId);
    case 'internal_note':
      return addInternalNote(data, propertyId, payload.note);
    default:
      return data;
  }
}

export function addTask(data, form) {
  const property = data.properties.find((item) => item.id === form.relatedPropertyId);
  const agent = getAgent(data, form.agentId || form.assignedAgentId);
  return {
    ...data,
    tasks: [
      {
        id: `task-${Date.now()}`,
        title: String(form.title || '').trim(),
        type: form.type,
        relatedPropertyId: form.relatedPropertyId,
        agentId: form.agentId || form.assignedAgentId,
        assignedAgentId: form.assignedAgentId || form.agentId,
        teamId: form.teamId || property?.teamId || agent?.teamId || '',
        createdBy: form.createdBy || form.agentId || form.assignedAgentId || 'system',
        dueDate: form.dueDate || daysFromToday(1),
        priority: form.priority,
        status: 'open',
        notes: String(form.notes || '').trim(),
        createdAt: daysFromToday(0),
        updatedAt: daysFromToday(0),
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

export function updateTask(data, taskId, patch) {
  return {
    ...data,
    tasks: data.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            title: patch.title ?? task.title,
            type: patch.type ?? task.type,
            priority: patch.priority ?? task.priority,
            dueDate: patch.dueDate ?? task.dueDate,
            notes: patch.notes ?? task.notes,
            status: patch.status ?? task.status,
            updatedAt: daysFromToday(0),
          }
        : task,
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
