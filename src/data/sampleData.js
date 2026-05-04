import { WORKFLOW_PHASES } from './workflowPhases.js';
import { addMonths, daysFromToday } from '../utils/dateUtils.js';
import { buildDealFromProperty } from '../utils/commissionUtils.js';

function phaseHistory(currentPhase, startDate) {
  return WORKFLOW_PHASES.slice(0, currentPhase).map((phase, index) => ({
    phaseId: phase.id,
    title: phase.title,
    changedAt: daysFromToday(-Math.max(0, 24 - index * 3)),
  })).map((entry, index) => ({
    ...entry,
    changedAt: index === 0 ? startDate : entry.changedAt,
  }));
}

function property(input) {
  const agreementEndDate =
    input.agreementEndDate || addMonths(input.agreementStartDate, 3);
  const now = daysFromToday(0);

  return {
    id: input.id,
    agentId: input.agentId,
    agentName: input.agentName,
    teamId: input.teamId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerType: input.customerType,
    location: input.location,
    area: input.area,
    price: input.price,
    propertyType: input.propertyType,
    transactionType: input.transactionType,
    marketType: input.marketType,
    agreementCode: input.agreementCode,
    agreementType: input.agreementType,
    agreementStartDate: input.agreementStartDate,
    agreementEndDate,
    source: input.source,
    currentPhase: input.currentPhase,
    phaseHistory: input.phaseHistory || phaseHistory(input.currentPhase, input.agreementStartDate),
    notes: input.notes,
    buyerCommissionPercent: input.buyerCommissionPercent ?? 2.5,
    sellerCommissionPercent: input.sellerCommissionPercent ?? 2.5,
    rentCommission: input.rentCommission || 0,
    status: input.status || 'active',
    closedAt: input.closedAt || null,
    createdAt: input.createdAt || input.agreementStartDate,
    updatedAt: input.updatedAt || now,
  };
}

export function createSeedData() {
  const teams = [
    { id: 'team-east', name: 'East Cairo Team', leaderId: 'agent-hana' },
    { id: 'team-west', name: 'West Cairo Team', leaderId: 'agent-karim' },
  ];

  const agents = [
    {
      id: 'agent-hana',
      name: 'Hana Nabil',
      phone: '0100 932 1001',
      role: 'team_leader',
      teamId: 'team-east',
      target: 10,
    },
    {
      id: 'agent-sara',
      name: 'Sara Adel',
      phone: '0100 232 1104',
      role: 'agent',
      teamId: 'team-east',
      target: 8,
    },
    {
      id: 'agent-omar',
      name: 'Omar Hassan',
      phone: '0112 884 3019',
      role: 'agent',
      teamId: 'team-east',
      target: 7,
    },
    {
      id: 'agent-karim',
      name: 'Karim Youssef',
      phone: '0109 700 9910',
      role: 'team_leader',
      teamId: 'team-west',
      target: 10,
    },
    {
      id: 'agent-mariam',
      name: 'Mariam Fawzy',
      phone: '0127 405 6640',
      role: 'agent',
      teamId: 'team-west',
      target: 6,
    },
    {
      id: 'agent-youssef',
      name: 'Youssef Aly',
      phone: '0109 746 8821',
      role: 'agent',
      teamId: 'team-west',
      target: 7,
    },
    {
      id: 'agent-manager',
      name: 'Nour El Din',
      phone: '0100 555 2026',
      role: 'manager',
      teamId: 'management',
      target: 0,
    },
  ];

  const properties = [
    property({
      id: 'prop-101',
      agreementCode: 'TA-2026-101',
      marketType: 'resale',
      transactionType: 'purchase',
      agreementType: 'exclusive',
      source: 'farming_online',
      agentId: 'agent-sara',
      agentName: 'Sara Adel',
      teamId: 'team-east',
      customerName: 'Ahmed Samir',
      customerPhone: '0100 445 2231',
      customerType: 'seller',
      location: 'New Cairo, Fifth Settlement',
      propertyType: 'apartment',
      notes: '3 bedrooms, garden view, ready to move. Needs updated photos before client previews.',
      price: 7800000,
      area: 165,
      agreementStartDate: daysFromToday(-9),
      currentPhase: 7,
      buyerCommissionPercent: 2.5,
      sellerCommissionPercent: 3,
      createdAt: daysFromToday(-9),
    }),
    property({
      id: 'prop-102',
      agreementCode: 'TA-2026-102',
      marketType: 'resale',
      transactionType: 'purchase',
      agreementType: 'open',
      source: 'relatives',
      agentId: 'agent-omar',
      agentName: 'Omar Hassan',
      teamId: 'team-east',
      customerName: 'Mona Khaled',
      customerPhone: '0111 903 4410',
      customerType: 'seller',
      location: 'Sheikh Zayed, District 16',
      propertyType: 'apartment',
      notes: '2 bedrooms, second floor, elevator. Seller negotiation on final net price.',
      price: 4300000,
      area: 125,
      agreementStartDate: daysFromToday(-78),
      agreementEndDate: daysFromToday(12),
      currentPhase: 5,
      createdAt: daysFromToday(-78),
    }),
    property({
      id: 'prop-103',
      agreementCode: 'TA-2026-103',
      marketType: 'resale',
      transactionType: 'rent',
      agreementType: 'rent',
      source: 'leads',
      agentId: 'agent-mariam',
      agentName: 'Mariam Fawzy',
      teamId: 'team-west',
      customerName: 'Nadine Refaat',
      customerPhone: '0122 118 5095',
      customerType: 'landlord',
      location: 'Maadi, Sarayat',
      propertyType: 'apartment',
      notes: 'Furnished 2 bedrooms with balcony. Book evening previews with two tenants.',
      price: 42000,
      area: 140,
      agreementStartDate: daysFromToday(-4),
      currentPhase: 6,
      buyerCommissionPercent: 0,
      sellerCommissionPercent: 0,
      rentCommission: 42000,
      createdAt: daysFromToday(-4),
    }),
    property({
      id: 'prop-104',
      agreementCode: 'TA-2026-104',
      marketType: 'primary',
      transactionType: 'purchase',
      agreementType: 'exclusive',
      source: 'friends',
      agentId: 'agent-youssef',
      agentName: 'Youssef Aly',
      teamId: 'team-west',
      customerName: 'Sherif Lotfy',
      customerPhone: '0106 990 3218',
      customerType: 'buyer',
      location: 'Mostakbal City',
      propertyType: 'apartment',
      notes: 'Primary unit, 3 bedrooms, 8-year installment plan. Check reservation form before signing.',
      price: 6200000,
      area: 150,
      agreementStartDate: daysFromToday(-9),
      currentPhase: 8,
      buyerCommissionPercent: 2.5,
      sellerCommissionPercent: 0,
      createdAt: daysFromToday(-9),
    }),
    property({
      id: 'prop-105',
      agreementCode: 'TA-2026-105',
      marketType: 'resale',
      transactionType: 'purchase',
      agreementType: 'exclusive',
      source: 'farming_offline',
      agentId: 'agent-sara',
      agentName: 'Sara Adel',
      teamId: 'team-east',
      customerName: 'Tarek Amin',
      customerPhone: '0101 222 8760',
      customerType: 'seller',
      location: '6th of October, West Somid',
      propertyType: 'twin_house',
      notes: 'Corner twin house, semi finished. Commission collected.',
      price: 11800000,
      area: 245,
      agreementStartDate: daysFromToday(-36),
      currentPhase: 10,
      buyerCommissionPercent: 3,
      sellerCommissionPercent: 3,
      status: 'closed',
      closedAt: daysFromToday(-3),
      createdAt: daysFromToday(-36),
    }),
  ];

  const agentsWithStats = agents.map((agent) => {
    const agentProperties = properties.filter((item) => item.agentId === agent.id);
    const activeInventoryCount = agentProperties.filter((item) => item.status !== 'closed').length;
    const closedDeals = agentProperties.filter((item) => item.status === 'closed');
    const commissionTotal = closedDeals.reduce(
      (sum, item) => sum + buildDealFromProperty(item, 'confirmed').totalCommission,
      0,
    );

    return {
      ...agent,
      commissionTotal,
      activeInventoryCount,
      closedDealsCount: closedDeals.length,
    };
  });

  const tasks = [
    {
      id: 'task-201',
      type: 'meeting',
      title: 'Seller negotiation meeting',
      relatedPropertyId: 'prop-102',
      agentId: 'agent-omar',
      dueDate: daysFromToday(1),
      priority: 'high',
      status: 'open',
      notes: 'Confirm minimum accepted price and commission side.',
    },
    {
      id: 'task-202',
      type: 'initial_preview',
      title: 'Initial preview and photos',
      relatedPropertyId: 'prop-103',
      agentId: 'agent-mariam',
      dueDate: daysFromToday(2),
      priority: 'medium',
      status: 'open',
      notes: 'Capture furnished condition and appliances list.',
    },
    {
      id: 'task-203',
      type: 'contract_check',
      title: 'Check buyer purchase agreement',
      relatedPropertyId: 'prop-104',
      agentId: 'agent-youssef',
      dueDate: daysFromToday(0),
      priority: 'high',
      status: 'open',
      notes: 'Review reservation clause and buyer payment schedule.',
    },
    {
      id: 'task-204',
      type: 'agreement_expiry',
      title: 'Renew open agreement',
      relatedPropertyId: 'prop-102',
      agentId: 'agent-omar',
      dueDate: daysFromToday(10),
      priority: 'high',
      status: 'open',
      notes: 'Agreement expires soon. Ask seller for renewal or exclusivity upgrade.',
    },
  ];

  const deals = properties.map((item) =>
    buildDealFromProperty(item, item.status === 'closed' ? 'confirmed' : 'potential'),
  );

  return { version: 2, agents: agentsWithStats, teams, properties, tasks, deals };
}
