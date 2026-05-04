# Team Management

Updated: 2026-05-04

## Hierarchy

```text
Manager/Admin
  Team Leader
    Team
      Agents
```

The local model stores:

- `users/agents`: role, teamIds, leaderId, managerId, status, target, timestamps.
- `teams`: managerId, teamLeaderIds, agentIds, target, status, timestamps.
- `properties`: ownerAgentId, teamId, createdBy, updatedBy.
- `tasks`: assignedAgentId, teamId, relatedPropertyId, createdBy.
- `deals`: ownerAgentId, teamId, propertyId.
- `agreements`: ownerAgentId, teamId, propertyId, approval fields.
- `ownershipHistory`: transfer/reassignment history.
- `auditLog`: success/denied action records.

## Agent Management

- Add agent: manager/admin only.
- Edit agent: manager/admin only; quick target/status edits are available in Team screen.
- Deactivate agent: manager/admin only and blocked while the agent owns active properties, open tasks, or open deals.
- Delete agent: manager/admin only and allowed only when active ownership is zero.
- Deactivation is preferred to hard delete because it preserves history.

## Transfer Rules

- Manager/admin can transfer an agent between any teams.
- Team leader transfer is restricted to own team scope.
- Transfers update the agent team, team membership lists, owned properties, owned tasks, deals, and agreements.
- Each transfer creates `agent_transferred` audit and ownership history records.

## Reassignment Rules

- Manager/admin can reassign properties/tasks across teams.
- Team leader can reassign only inside own team.
- Agents cannot reassign property or task ownership to another agent.
- Property reassignment syncs property, deal, agreement, and related task team ownership.
- Task reassignment changes assigned agent and team.

## Audit Events

Logged actions include:

- `agent_created`
- `agent_updated`
- `agent_deactivated`
- `agent_deleted`
- `agent_transferred`
- `property_reassigned`
- `task_reassigned`
- `permission_denied`
- `agreement_approved`
- `deal_closed`
- `commission_recorded`
