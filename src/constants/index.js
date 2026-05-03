export const COMPANY = {
  legalName: 'RE/MAX Top Agents',
  appName: 'Top Agents Collaboration',
};

export const PHASES = [
  { id: 1, title: 'Bring unit', short: 'Unit', color: '#0f766e' },
  { id: 2, title: 'Client meeting', short: 'Meeting', color: '#2563eb' },
  { id: 3, title: 'Initial preview', short: 'Preview', color: '#7c3aed' },
  { id: 4, title: 'Pricing', short: 'Pricing', color: '#b45309' },
  { id: 5, title: 'Negotiation', short: 'Negotiate', color: '#db2777' },
  { id: 6, title: 'Ads and marketing', short: 'Marketing', color: '#0891b2' },
  { id: 7, title: 'Client previews', short: 'Clients', color: '#059669' },
  { id: 8, title: 'Contracts check', short: 'Contracts', color: '#475569' },
  { id: 9, title: 'Signing appointment', short: 'Signing', color: '#ea580c' },
  { id: 10, title: 'Closing and commission', short: 'Closed', color: '#16a34a' },
];

export const CATEGORIES = [
  { value: 'primary', label: 'Primary' },
  { value: 'resale', label: 'Resale' },
];

export const PURPOSES = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'rent', label: 'Rent' },
];

export const AGREEMENT_TYPES = [
  {
    value: 'buyer_purchase',
    label: 'Purchase agreement',
    short: 'Buyer',
    side: 'buyer',
  },
  {
    value: 'open',
    label: 'Open مفتوح',
    short: 'Open',
    side: 'seller',
  },
  {
    value: 'exclusive',
    label: 'Exclusive حصرى',
    short: 'Exclusive',
    side: 'seller',
  },
  {
    value: 'rent',
    label: 'Rent ايجار',
    short: 'Rent',
    side: 'seller',
  },
];

export const UNIT_SOURCES = [
  { value: 'farming_online', label: 'Farming online' },
  { value: 'farming_offline', label: 'Farming offline' },
  { value: 'relatives', label: 'Relatives' },
  { value: 'friends', label: 'Friends' },
  { value: 'leads', label: 'Leads' },
];

export const TASK_TYPES = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'initial_preview', label: 'Initial preview' },
  { value: 'follow_up', label: 'Follow up' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'contract_check', label: 'Contract check' },
  { value: 'signing', label: 'Signing' },
];
