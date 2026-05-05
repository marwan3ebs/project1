# Analytics and Reports

Updated: 2026-05-05

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

The Reports screen now uses executive-style section navigation:

- Overview: executive KPIs, metric trends, open vs exclusive, primary vs resale.
- Pipeline: phase distribution, rent vs purchase, bottleneck phase, conversion, stale work.
- Commission: top commission agents and team ranking.
- Teams: team ranking, inventory, closed deals, potential and confirmed commission.
- Agents: agent leaderboard, target progress, agreements, closed deals, follow-ups, overdue tasks, commission.
- Risk: expiring agreements, overdue follow-ups, bottleneck phase, open tasks.
- Sources: lead/source volume, closed deals, conversion quality.
- Export: recommendations and export-ready biweekly report text.

## Professionalization Notes

- KPI cards are intentionally compact for desktop.
- Chart colors are restrained navy, charcoal, RE/MAX red, and status colors rather than random bright demo colors.
- Section navigation keeps the reports page from becoming one overwhelming scroll while preserving the analytics model.

## Known Limitations

- Export text is generated locally for copy/paste; no PDF/Excel export yet.
- Trends use deterministic demo comparison values until historical snapshots exist.
- Charts are lightweight dashboard components rather than full interactive chart library widgets.
