import { buildDealFromProperty } from './commissionUtils.js';
import { daysFromToday } from './dateUtils.js';

export function normalizeCrmData(input) {
  const now = daysFromToday(0);
  const source = input || {};
  const agents = (source.agents || source.users || []).map((agent) => ({
    ...agent,
    status: agent.status || (agent.isActive === false ? 'inactive' : 'active'),
    isActive: agent.isActive !== false && agent.status !== 'inactive',
    teamIds: agent.teamIds?.length ? agent.teamIds : [agent.teamId].filter(Boolean),
    createdAt: agent.createdAt || now,
    updatedAt: agent.updatedAt || now,
  }));

  const agentById = Object.fromEntries(agents.map((agent) => [agent.id, agent]));

  const teams = (source.teams || []).map((team) => ({
    ...team,
    status: team.status || 'active',
    teamLeaderIds: team.teamLeaderIds?.length ? team.teamLeaderIds : [team.leaderId].filter(Boolean),
    agentIds: team.agentIds?.length
      ? team.agentIds
      : agents.filter((agent) => agent.teamId === team.id && agent.role === 'agent').map((agent) => agent.id),
    createdAt: team.createdAt || now,
    updatedAt: team.updatedAt || now,
  }));

  const properties = (source.properties || []).map((property) => {
    const ownerAgentId = property.ownerAgentId || property.agentId;
    const agent = agentById[ownerAgentId] || agentById[property.agentId];

    return {
      ...property,
      ownerAgentId,
      agentId: property.agentId || ownerAgentId,
      agentName: property.agentName || agent?.name || 'Unassigned',
      teamId: property.teamId || agent?.teamId || '',
      clientId: property.clientId || `client-${property.id}`,
      createdBy: property.createdBy || ownerAgentId || source.currentUserId || 'system',
      updatedBy: property.updatedBy || property.createdBy || ownerAgentId || 'system',
      status: property.status || 'active',
      createdAt: property.createdAt || property.agreementStartDate || now,
      updatedAt: property.updatedAt || now,
    };
  });

  const propertyById = Object.fromEntries(properties.map((property) => [property.id, property]));

  const clients = (source.clients?.length
    ? source.clients
    : properties.map((property) => ({
        id: property.clientId,
        name: property.customerName,
        phone: property.customerPhone,
        type: property.customerType,
        propertyIds: [property.id],
        notes: property.notes,
      }))).map((client) => {
        const property = properties.find((item) => item.clientId === client.id || client.propertyIds?.includes(item.id));
        return {
          ...client,
          ownerAgentId: client.ownerAgentId || property?.ownerAgentId || client.agentId,
          agentId: client.agentId || client.ownerAgentId || property?.agentId,
          teamId: client.teamId || property?.teamId || '',
          status: client.status || 'active',
          createdBy: client.createdBy || property?.createdBy || client.ownerAgentId || 'system',
          createdAt: client.createdAt || property?.createdAt || now,
          updatedAt: client.updatedAt || property?.updatedAt || now,
        };
      });

  const agreements = (source.agreements?.length
    ? source.agreements
    : properties.map((property) => ({
        id: `agreement-${property.id}`,
        propertyId: property.id,
        agreementCode: property.agreementCode,
        agreementType: property.agreementType,
        transactionType: property.transactionType,
        startDate: property.agreementStartDate,
        endDate: property.agreementEndDate,
      }))).map((agreement) => {
        const property = propertyById[agreement.propertyId];
        return {
          ...agreement,
          ownerAgentId: agreement.ownerAgentId || property?.ownerAgentId || agreement.agentId,
          agentId: agreement.agentId || property?.agentId || agreement.ownerAgentId,
          teamId: agreement.teamId || property?.teamId || '',
          status: agreement.status || (property?.status === 'closed' ? 'completed' : 'active'),
          requiresApproval: Boolean(agreement.requiresApproval),
          approvedBy: agreement.approvedBy || null,
          approvedAt: agreement.approvedAt || null,
          createdBy: agreement.createdBy || property?.createdBy || agreement.ownerAgentId || 'system',
          createdAt: agreement.createdAt || property?.createdAt || now,
          updatedAt: agreement.updatedAt || property?.updatedAt || now,
        };
      });

  const tasks = (source.tasks || []).map((task) => {
    const property = propertyById[task.relatedPropertyId || task.propertyId];
    const assignedAgentId = task.assignedAgentId || task.agentId || property?.ownerAgentId;
    const agent = agentById[assignedAgentId];

    return {
      ...task,
      assignedAgentId,
      agentId: task.agentId || assignedAgentId,
      relatedPropertyId: task.relatedPropertyId || task.propertyId || property?.id,
      teamId: task.teamId || property?.teamId || agent?.teamId || '',
      createdBy: task.createdBy || assignedAgentId || 'system',
      createdAt: task.createdAt || now,
      updatedAt: task.updatedAt || now,
    };
  });

  const deals = (source.deals?.length ? source.deals : properties.map((property) => buildDealFromProperty(property)))
    .map((deal) => {
      const property = propertyById[deal.propertyId];
      return {
        ...deal,
        ownerAgentId: deal.ownerAgentId || property?.ownerAgentId || deal.agentId,
        agentId: deal.agentId || property?.agentId || deal.ownerAgentId,
        teamId: deal.teamId || property?.teamId || '',
        status: deal.status || (property?.status === 'closed' ? 'confirmed' : 'potential'),
      };
    });

  return {
    ...source,
    version: 4,
    agents,
    users: agents,
    teams,
    clients,
    properties,
    agreements,
    tasks,
    deals,
    ownershipHistory: source.ownershipHistory || [],
    auditLog: source.auditLog || [],
    companySettings: source.companySettings || {
      commissionBuyerDefault: 2.5,
      commissionSellerDefault: 2.5,
      agreementMonths: 3,
    },
  };
}
