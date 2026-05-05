import React from 'react';

import { StatusBadge } from './StatusBadge.js';

export function AgreementBadge({ type }) {
  const label = type === 'buyer_purchase' ? 'Buyer' : type === 'exclusive' ? 'Exclusive' : type === 'rent' ? 'Rent' : 'Open';
  const tone = type === 'exclusive' ? 'primary' : type === 'rent' ? 'info' : type === 'buyer_purchase' ? 'success' : 'muted';
  return <StatusBadge label={label} tone={tone} />;
}
