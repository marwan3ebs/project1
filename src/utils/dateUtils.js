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

export function normalizeAgreementEndDate(property) {
  if (property.agreementEndDate) {
    return property.agreementEndDate;
  }

  if (property.agreementStartDate && ['open', 'exclusive', 'rent'].includes(property.agreementType)) {
    return addMonths(property.agreementStartDate, 3);
  }

  return property.agreementStartDate || daysFromToday(0);
}
