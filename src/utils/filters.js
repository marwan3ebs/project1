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
        property.title,
        property.district,
        property.compound,
        property.customerName,
        property.customerPhone,
        property.agentName,
        property.agreementCode,
        property.propertyType,
        property.notes,
      ].some((value) => includesText(value, query));

    const matchesAgent = filters.agentId === 'all' || property.agentId === filters.agentId;
    const matchesTeam = !filters.teamId || filters.teamId === 'all' || property.teamId === filters.teamId;
    const matchesMarket = !filters.marketType || filters.marketType === 'all' || property.marketType === filters.marketType;
    const matchesStatus = !filters.status || filters.status === 'all' || property.status === filters.status;
    const matchesLocation =
      !filters.location ||
      filters.location === 'all' ||
      includesText(property.location, String(filters.location).toLowerCase()) ||
      includesText(property.district, String(filters.location).toLowerCase()) ||
      includesText(property.compound, String(filters.location).toLowerCase());
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
      matchesTeam &&
      matchesMarket &&
      matchesStatus &&
      matchesLocation &&
      matchesAgreement &&
      matchesTransaction &&
      matchesSource &&
      matchesPhase &&
      matchesExpiring
    );
  });
}

export function sortPropertiesForCrm(properties, sortBy = 'expiring_soon') {
  return [...properties].sort((a, b) => {
    if (sortBy === 'newest') {
      return String(b.createdAt || b.updatedAt).localeCompare(String(a.createdAt || a.updatedAt));
    }

    if (sortBy === 'highest_price') {
      return Number(b.price || 0) - Number(a.price || 0);
    }

    if (sortBy === 'highest_commission') {
      const commissionA = Number(a.rentCommission || 0) || (Number(a.price || 0) * ((Number(a.buyerCommissionPercent || 0) + Number(a.sellerCommissionPercent || 0)) / 100));
      const commissionB = Number(b.rentCommission || 0) || (Number(b.price || 0) * ((Number(b.buyerCommissionPercent || 0) + Number(b.sellerCommissionPercent || 0)) / 100));
      return commissionB - commissionA;
    }

    if (sortBy === 'latest_activity') {
      return String(b.lastActivityAt || b.updatedAt).localeCompare(String(a.lastActivityAt || a.updatedAt));
    }

    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }

    return String(a.agreementEndDate).localeCompare(String(b.agreementEndDate));
  });
}
