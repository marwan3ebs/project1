# Analytics and Reports

Updated: 2026-05-04

## Utilities

`src/utils/analyticsUtils.js` builds scoped analytics from the same data screens receive:

- Active inventory
- Signed agreements
- Closed deals
- Confirmed commission
- Potential commission
- Team ranking
- Agent ranking
- Top closing, inventory, and commission agents
- Agreement expiry risk
- Open vs exclusive ratio
- Rent vs purchase ratio
- Primary vs resale ratio
- Source performance
- Deal phase distribution
- Bottleneck phase
- Conversion rate
- Biweekly closed deals

## Charts

Charts use React Native `View` components, so no web-only chart dependency is required:

- `ChartCard`
- `BarChart`
- `HorizontalBarChart`
- `DonutChart`
- `MetricTrend`

## Report Scopes

- Manager/admin: company-wide reports, optional team and agent filters.
- Team leader: own team reports, optional agent filters inside scoped data.
- Agent: personal performance only.

## Report Sections

The Reports screen includes:

- Executive Summary
- Agreements & Inventory
- Deal Pipeline
- Commission Analysis
- Team Performance
- Agent Performance
- Risk & Follow-up Alerts
- Source Quality Analysis
- Recommendations
- Export-ready report text

## Known Limitations

- Export text is generated locally for copy/paste; no PDF/Excel export yet.
- Trends use deterministic demo comparison values until historical snapshots exist.
- Charts are lightweight dashboard components rather than full interactive chart library widgets.
