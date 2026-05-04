import React from 'react';

import { StatusBadge } from './StatusBadge.js';

export function AgreementBadge({ type }) {
  const label = type === 'exclusive' ? 'Exclusive' : type === 'rent' ? 'Rent' : 'Open';
  const tone = type === 'exclusive' ? 'primary' : type === 'rent' ? 'info' : 'muted';
  return <StatusBadge label={label} tone={tone} />;
}
