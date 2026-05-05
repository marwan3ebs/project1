# CRM Data Model

The app still uses local demo data and AsyncStorage, but the data is shaped to resemble a future backend model.

## Top-Level Collections

- `agents`
- `teams`
- `properties`
- `tasks`
- `deals`

## Property

Fields:

- `id`
- `agentId`
- `agentName`
- `teamId`
- `customerName`
- `customerPhone`
- `customerType`: `seller`, `buyer`, `tenant`, `landlord`
- `location`
- `area`
- `price`
- `propertyType`: `apartment`, `villa`, `studio`, `office`, `twin_house`, `duplex`
- `transactionType`: `rent`, `purchase`
- `marketType`: `primary`, `resale`
- `agreementCode`
- `agreementType`: `open`, `exclusive`, `rent`
- `agreementStartDate`
- `agreementEndDate`
- `source`: `farming_online`, `farming_offline`, `relatives`, `friends`, `leads`
- `currentPhase`
- `phaseHistory`
- `notes`
- `buyerCommissionPercent`
- `sellerCommissionPercent`
- `rentCommission`
- `status`: `active`, `closed`
- `closedAt`
- `createdAt`
- `updatedAt`

## Agent

Fields:

- `id`
- `name`
- `phone`
- `role`: `agent`, `team_leader`, `manager`
- `teamId`
- `target`
- `commissionTotal`
- `activeInventoryCount`
- `closedDealsCount`

## Task

Fields:

- `id`
- `title`
- `type`: `meeting`, `initial_preview`, `follow_up`, `pricing`, `contract_check`, `signing`, `agreement_expiry`
- `relatedPropertyId`
- `agentId`
- `dueDate`
- `priority`
- `status`
- `notes`

## Deal

Fields:

- `id`
- `propertyId`
- `buyerCommissionPercent`
- `sellerCommissionPercent`
- `buyerCommissionAmount`
- `sellerCommissionAmount`
- `totalCommission`
- `closedAt`
- `status`: `potential`, `confirmed`
