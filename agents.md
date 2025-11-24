## Agent Hub – Competitive Intelligence Engine (v1)

This hub binds the six web-analysis agents to MAOS governance. Every agent advertises its assignment matrix, trigger cadence, output contract, confidence scoring shape, and custodian hooks. All agents inherit the Charter-standard payload envelope:

```json
{
  "agent_id": "",
  "client_id": "",
  "competitor_id": "",
  "delta_type": "",
  "signal_payload": {},
  "confidence": {
    "score": 0,
    "factors": []
  },
  "governance": {
    "custodian": "",
    "hash": "",
    "policy_refs": []
  },
  "next_actions": []
}
```

### Shared Assignment Rules
- Route by `client_id` → `competitor_priority` tier (A, B, C).
- High-risk categories (pricing, SKU deltas, campaigns targeting core keywords) escalate to Reflex immediately.
- If multiple agents detect the same URI delta within 6 hours, merge into a single case file and elevate confidence by +0.1 (max 0.98).

### Agent Registry

| Agent | Trigger Logic | Primary Surface | Output Contract | Confidence Factors | Governance Hooks |
| --- | --- | --- | --- | --- | --- |
| `surveillance_agent` | 5 min heartbeat for Tier-A competitors; 15 min for Tier-B; hourly for Tier-C | Change detection on home/landing/pricing pages; hero messaging; CTA shifts | DOM diff summary + semantic tags (`messaging`, `pricing`, `offer`) + snapshot URLs | DOM stability, checksum variance, prior accuracy of selector set | Custodian: `Sentinel`; Policy refs: `CH-EXT-01`, `WEB-SAFE-02`; auto-hash HTML + diff |
| `research_agent` | Twice daily or on CRM flag; manual override allowed | Long-form assets (blogs, whitepapers, case studies) | Extracted topic graph + keyword density + publication cadence | Source freshness, NLP confidence, cross-agent corroboration | Custodian: `Archivist`; Policy `INTEL-RCH-04`; attaches PDF/text hash |
| `competitor_watch_agent` | Event-driven via RSS/WebSub + manual watchlist; fallback 30 min poll | Press releases, newsroom feeds, public filings | Event object + market impact classification + recommended posture | Source authority, event type criticality, upstream verification | Custodian: `Observer`; Policy `CH-EXT-02` |
| `web_crawler_agent` | Rolling crawl queue respecting robots.txt; recrawl interval derived from volatility score | Deep site structure, product docs, feature pages | URL inventory + feature diff + metadata tags | Crawl depth success, HTTP status distribution, content similarity ratio | Custodian: `CrawlerOps`; Policy `CRAWL-01`; throttle ledger |
| `signal_harvester_agent` | Real-time streams (social APIs, ad libraries, PPC monitors); sub-minute for paid media | Paid ads, social sentiment, PPC auction data | JSON stream chunks + sentiment + spend estimate + keyword overlap | API reliability, rate-limit health, multi-source agreement | Custodian: `Harvester`; Policy `SOC-ADS-03`; attaches provider receipts |
| `content_diff_agent` | Executes after any of the above produce fresh artifacts | Text + creative diff across previous snapshot | Side-by-side diff + normalized delta tokens + severity | Snapshot integrity, diff size, lexical confidence | Custodian: `DiffControl`; Policy `GOV-DIFF-05`; ensures reversible audit trail |

### Trigger Escalation Matrix
- **Red Alert:** Pricing changes, SKU launches, competitor targeting client’s primary keywords, or ad spend spikes > 25% week-over-week → reflex task within 60 seconds.
- **Yellow Alert:** Messaging shifts, new campaigns, sentiment slide > 10 points → reflex task within 15 minutes.
- **Green:** Routine updates; stay inside Intelligence Log until corroborated.

### Output Routing
1. All payloads serialize to the Competitive Intelligence Engine queue (`src/competitive-intel/engine.ts` interface).
2. `delta_type` determines Teamwork playbook:
   - `pricing_change` → Revenue Defense playbook.
   - `campaign_launch` → AdOps Counterplay.
   - `keyword_collision` → SEO/PPC Surge Response.
   - `sentiment_shift` → Communications Sprint.
3. Each task inherits SLA + owner from the Client Matrix.

### Confidence Scoring Template
- Start at 0.4 base.
- +0.2 for first-party or verified feed.
- +0.1 if diff magnitude > threshold.
- +0.1 if corroborated by second agent.
- -0.1 if crawl health degraded or selectors unstable.
- Cap at 0.98; floor at 0.2.

### Governance Hooks
- Custodian hash = `sha256(agent_id + timestamp + normalized_payload)`.
- Every payload logs to Codex under `Competitive Intelligence Engine > {client}`.
- Manual overrides require `governance.policy_refs` annotation and are auto-reviewed in weekly Heartbeats.
