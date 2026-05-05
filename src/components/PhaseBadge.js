import React from 'react';

import { getPhase } from '../services/crmService.js';
import { StatusBadge } from './StatusBadge.js';

export function PhaseBadge({ phaseId }) {
  const phase = getPhase(phaseId);
  return <StatusBadge label={`P${phase.id} ${phase.short}`} tone={phase.id === 10 ? 'success' : 'info'} />;
}
