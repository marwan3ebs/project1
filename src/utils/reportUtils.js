import { WORKFLOW_PHASES } from '../data/workflowPhases.js';
import { calculateCommission } from './commissionUtils.js';
import { getBiweeklyWindow, isBetween } from './dateUtils.js';

export function generateBiweeklyReport(data) {
  const window = getBiweeklyWindow();
  const activeProperties = data.properties.filter((property) => property.status !== 'closed');
  const signedThisPeriod = data.properties.filter((property) =>
    isBetween(property.createdAt, window.start, window.end),
  );
  const closedThisPeriod = data.properties.filter((property) =>
    isBetween(property.closedAt, window.start, window.end),
  );

  const agentRows = data.agents.map((agent) => {
    const active = activeProperties.filter((property) => property.agentId === agent.id);
    const signed = signedThisPeriod.filter((property) => property.agentId === agent.id);
    const closed = closedThisPeriod.filter((property) => property.agentId === agent.id);
    const exclusive = active.filter((property) => property.agreementType === 'exclusive');
    const commission = closed.reduce(
      (sum, property) => sum + calculateCommission(property).totalCommission,
      0,
    );

    return {
      agent,
      activeInventory: active.length,
      signedAgreements: signed.length,
      closedDeals: closed.length,
      exclusiveListings: exclusive.length,
      commission,
    };
  });

  const phaseCounts = WORKFLOW_PHASES.map((phase) => ({
    ...phase,
    count: data.properties.filter((property) => Number(property.currentPhase) === phase.id).length,
  }));

  const teamTotals = data.teams.map((team) => {
    const teamAgents = data.agents.filter((agent) => agent.teamId === team.id);
    const teamAgentIds = teamAgents.map((agent) => agent.id);
    const teamProperties = data.properties.filter((property) => teamAgentIds.includes(property.agentId));
    const teamClosed = teamProperties.filter((property) => property.status === 'closed');

    return {
      team,
      activeInventory: teamProperties.filter((property) => property.status !== 'closed').length,
      closedDeals: teamClosed.length,
      commission: teamClosed.reduce(
        (sum, property) => sum + calculateCommission(property).totalCommission,
        0,
      ),
    };
  });

  return {
    window,
    activeProperties,
    signedThisPeriod,
    closedThisPeriod,
    agentRows,
    phaseCounts,
    teamTotals,
    totalPotentialCommission: activeProperties.reduce(
      (sum, property) => sum + calculateCommission(property).totalCommission,
      0,
    ),
    totalClosedCommission: closedThisPeriod.reduce(
      (sum, property) => sum + calculateCommission(property).totalCommission,
      0,
    ),
  };
}
