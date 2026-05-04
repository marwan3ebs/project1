export function hasActiveOwnedWork(data, agentId) {
  const activeProperties = (data.properties || []).filter(
    (property) =>
      (property.ownerAgentId === agentId || property.agentId === agentId) &&
      !['closed', 'archived', 'expired'].includes(property.status),
  );
  const activeTasks = (data.tasks || []).filter(
    (task) =>
      (task.assignedAgentId === agentId || task.agentId === agentId) &&
      task.status !== 'done',
  );
  const activeDeals = (data.deals || []).filter(
    (deal) =>
      (deal.ownerAgentId === agentId || deal.agentId === agentId) &&
      deal.status !== 'confirmed',
  );

  return {
    activeProperties,
    activeTasks,
    activeDeals,
    blocked: activeProperties.length > 0 || activeTasks.length > 0 || activeDeals.length > 0,
  };
}

export function createOwnershipHistoryEntry({
  action,
  entityType,
  entityId,
  fromUserId = null,
  toUserId = null,
  fromTeamId = null,
  toTeamId = null,
  performedBy,
  reason = '',
  createdAt,
}) {
  return {
    id: `own-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    entityType,
    entityId,
    fromUserId,
    toUserId,
    fromTeamId,
    toTeamId,
    performedBy: performedBy?.id || performedBy || 'system',
    reason,
    createdAt,
  };
}

export function appendOwnershipHistory(data, entry) {
  return {
    ...data,
    ownershipHistory: [entry, ...(data.ownershipHistory || [])].slice(0, 250),
  };
}
