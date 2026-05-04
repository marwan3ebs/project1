import { daysFromToday } from '../utils/dateUtils.js';

export const AUDIT_ACTIONS = {
  AGENT_CREATED: 'agent_created',
  AGENT_UPDATED: 'agent_updated',
  AGENT_DEACTIVATED: 'agent_deactivated',
  AGENT_DELETED: 'agent_deleted',
  AGENT_TRANSFERRED: 'agent_transferred',
  PROPERTY_REASSIGNED: 'property_reassigned',
  TASK_REASSIGNED: 'task_reassigned',
  PERMISSION_DENIED: 'permission_denied',
  AGREEMENT_APPROVED: 'agreement_approved',
  DEAL_CLOSED: 'deal_closed',
  COMMISSION_RECORDED: 'commission_recorded',
};

export function createAuditEntry({ action, user, result = 'success', targetType, targetId, details = '' }) {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    userId: user?.id || 'system',
    role: user?.role || 'system',
    result,
    targetType,
    targetId,
    details,
    createdAt: daysFromToday(0),
  };
}

export function appendAudit(data, entry) {
  return {
    ...data,
    auditLog: [entry, ...(data.auditLog || [])].slice(0, 250),
  };
}

export function logAudit(data, payload) {
  return appendAudit(data, createAuditEntry(payload));
}

export function logDenied(data, user, action, targetType, targetId, details) {
  return logAudit(data, {
    action: AUDIT_ACTIONS.PERMISSION_DENIED,
    user,
    result: 'denied',
    targetType,
    targetId,
    details: details || action,
  });
}
