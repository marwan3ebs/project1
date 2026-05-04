export function formatMoney(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return 'EGP 0';
  }

  if (Math.abs(number) >= 1000000) {
    return `EGP ${(number / 1000000).toFixed(number >= 10000000 ? 1 : 2)}M`;
  }

  if (Math.abs(number) >= 1000) {
    return `EGP ${(number / 1000).toFixed(0)}K`;
  }

  return `EGP ${number.toLocaleString('en')}`;
}

export function calculateCommission(property) {
  const price = Number(property.price || 0);
  const isRent = property.transactionType === 'rent';
  const buyerPercent = isRent ? 0 : Number(property.buyerCommissionPercent ?? 2.5);
  const sellerPercent = isRent ? 0 : Number(property.sellerCommissionPercent ?? 2.5);
  const buyerCommissionAmount = isRent ? 0 : price * (buyerPercent / 100);
  const sellerCommissionAmount = isRent ? Number(property.rentCommission || price || 0) : price * (sellerPercent / 100);
  const totalCommission = buyerCommissionAmount + sellerCommissionAmount;

  return {
    buyerCommissionPercent: buyerPercent,
    sellerCommissionPercent: sellerPercent,
    buyerCommissionAmount,
    sellerCommissionAmount,
    totalCommission,
  };
}

export function buildDealFromProperty(property, status = property.status === 'closed' ? 'confirmed' : 'potential') {
  const commission = calculateCommission(property);

  return {
    id: `deal-${property.id}`,
    propertyId: property.id,
    ...commission,
    closedAt: property.closedAt || null,
    status,
  };
}
