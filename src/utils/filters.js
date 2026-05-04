import { daysUntil } from './dateUtils.js';

function includesText(value, query) {
  return String(value || '').toLowerCase().includes(query);
}

export function filterProperties(properties, filters) {
  const query = String(filters.query || '').trim().toLowerCase();

  return properties.filter((property) => {
    const matchesQuery =
      !query ||
      [
        property.location,
        property.customerName,
        property.customerPhone,
        property.agentName,
        property.agreementCode,
        property.propertyType,
        property.notes,
      ].some((value) => includesText(value, query));

    const matchesAgent = filters.agentId === 'all' || property.agentId === filters.agentId;
    const matchesAgreement =
      filters.agreementType === 'all' || property.agreementType === filters.agreementType;
    const matchesTransaction =
      filters.transactionType === 'all' || property.transactionType === filters.transactionType;
    const matchesSource = filters.source === 'all' || property.source === filters.source;
    const matchesPhase =
      filters.currentPhase === 'all' || Number(property.currentPhase) === Number(filters.currentPhase);
    const matchesExpiring =
      !filters.expiringSoon ||
      (property.status !== 'closed' && daysUntil(property.agreementEndDate) <= 30);

    return (
      matchesQuery &&
      matchesAgent &&
      matchesAgreement &&
      matchesTransaction &&
      matchesSource &&
      matchesPhase &&
      matchesExpiring
    );
  });
}

export function sortPropertiesForCrm(properties) {
  return [...properties].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }

    return String(a.agreementEndDate).localeCompare(String(b.agreementEndDate));
  });
}
