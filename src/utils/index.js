import { AGREEMENT_TYPES, PHASES, PURPOSES, UNIT_SOURCES } from '../constants/index.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toISODate(date) {
  const value = new Date(date);
  value.setHours(12, 0, 0, 0);
  return value.toISOString().slice(0, 10);
}

export function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function addMonths(isoDate, months) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setMonth(date.getMonth() + months);
  return toISODate(date);
}

export function formatDate(isoDate) {
  if (!isoDate) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${isoDate}T12:00:00`));
}

export function formatMoney(value) {
  if (!Number.isFinite(Number(value))) {
    return 'EGP 0';
  }

  const number = Number(value);

  if (Math.abs(number) >= 1000000) {
    return `EGP ${(number / 1000000).toFixed(number >= 10000000 ? 1 : 2)}M`;
  }

  if (Math.abs(number) >= 1000) {
    return `EGP ${(number / 1000).toFixed(0)}K`;
  }

  return `EGP ${number.toLocaleString('en')}`;
}

export function daysUntil(isoDate) {
  if (!isoDate) {
    return null;
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const target = new Date(`${isoDate}T12:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function isBetween(isoDate, startIso, endIso) {
  if (!isoDate) {
    return false;
  }

  return isoDate >= startIso && isoDate <= endIso;
}

export function getBiweeklyWindow(reference = new Date()) {
  const end = toISODate(reference);
  const start = addDays(end, -13);
  return { start, end };
}

export function getLabel(items, value) {
  return items.find((item) => item.value === value)?.label || value;
}

export function getShortAgreementLabel(value) {
  return AGREEMENT_TYPES.find((item) => item.value === value)?.short || value;
}

export function getPurposeLabel(value) {
  return getLabel(PURPOSES, value);
}

export function getSourceLabel(value) {
  return getLabel(UNIT_SOURCES, value);
}

export function getPhase(id) {
  return PHASES.find((phase) => phase.id === Number(id)) || PHASES[0];
}

export function calculateCommission(property) {
  if (property.purpose === 'rent') {
    return Number(property.rentCommission || 0);
  }

  const price = Number(property.price || 0);
  const buyerPercent = Number(property.buyerCommissionPercent || 0);
  const sellerPercent = Number(property.sellerCommissionPercent || 0);
  return price * ((buyerPercent + sellerPercent) / 100);
}

export function generateAgreementCode(properties) {
  const year = new Date().getFullYear();
  const sequence = String(properties.length + 101).padStart(3, '0');
  return `TA-${year}-${sequence}`;
}

export function summarizeAgent(agent, properties) {
  const owned = properties.filter((property) => property.agentId === agent.id);
  const active = owned.filter((property) => property.status !== 'closed');
  const closed = owned.filter((property) => property.status === 'closed');
  const exclusive = active.filter((property) => property.agreementType === 'exclusive');
  const inventoryValue = active.reduce((sum, property) => sum + Number(property.price || 0), 0);

  return {
    inventory: active.length,
    closed: closed.length,
    exclusive: exclusive.length,
    inventoryValue,
    commission: closed.reduce((sum, property) => sum + calculateCommission(property), 0),
  };
}

export function getAgreementAlert(property) {
  const remaining = daysUntil(property.endDate);

  if (remaining === null || property.status === 'closed') {
    return null;
  }

  if (remaining < 0) {
    return { tone: 'danger', label: `${Math.abs(remaining)} days late` };
  }

  if (remaining <= 14) {
    return { tone: 'warning', label: `${remaining} days left` };
  }

  return { tone: 'calm', label: `${remaining} days left` };
}
