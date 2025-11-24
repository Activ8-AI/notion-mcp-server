## Competitive Intelligence Engine (v1)

### Purpose
- Restores Charter compliance by giving MAOS continuous external awareness.
- Mirrors the existing internal Reflex + Action Matrix stack with an external surveillance organ.
- Feeds Client Portal, Codex, Teamwork, Heartbeats, KPI/RPM mapping, and Reflex Responses with structured competitive deltas.

### Operating Scope
- **Classification:** MAOS → Intelligence Plane → Web Analysis Agents → Client Portal.
- **Status:** Required – Client Portal cannot be blind to competitor/market movement.
- **Coverage:** Competitor moves, industry shifts, pricing, positioning, campaigns, ads, SEO/PPC, product launches, feature updates, public sentiment, LLM ecosystem signals, sector movement.

### Core Responsibilities
1. **Competitor Tracking** – automated scraping/monitoring of owned sites, pricing pages, blogs, press centers, ad libraries, social channels, SERP leaderboards, PPC auctions, and release feeds.
2. **Client Comparison Layer** – maps detected deltas to each client’s strategic surface area (threats, openings, weak spots, value gaps).
3. **Taskable Outputs** – delivers ready-to-execute deltas into Teamwork; no passive summaries.
4. **Charter-Standard Briefs** – summary, market impact, strategic implication, recommended actions, governance notes, confidence score, custodian hash.
5. **Portal Embedding** – Competitor Intelligence tab, Industry Radar, Trend Watch, risk levels, action recommendations, revenue impact model.

### System Components
| Component | Description | Key Inputs | Primary Outputs |
| --- | --- | --- | --- |
| **Competitor Definition Map** | Unified registry of competitor entities per client, stored in Notion/Codex and synced via CLI | Client Matrix, onboarding forms, CRM exports, historical briefs | Normalized `competitor_profile` objects with tracking coordinates & priority |
| **Web Analysis Agents** | Multi-agent lattice (`surveillance_agent`, `research_agent`, `competitor_watch_agent`, `web_crawler_agent`, `signal_harvester_agent`, `content_diff_agent`) orchestrated through MCP | Competitor definition map, crawl schedules, governance constraints | Parsed signals, diff payloads, metadata, confidence heuristics |
| **Agent Hub (agents.md)** | Assignment + trigger registry, output contracts, governance hooks | Charter policies, MAOS playbooks | Deterministic routing tables, custodian signatures |
| **Reflex → Teamwork Pipelines** | Converts agent deltas into actionable Teamwork tickets with Reflex metadata | Delta payloads, severity scoring, Client Portal context | Auto-created tasks with SLA, owner, and cross-links |
| **Client Portal Integration** | Exposes Competitor Intelligence dashboards | Aggregated deltas, confidence scores, revenue impact models | Tabs: Intelligence, Industry Radar, Trend Watch, Risk/Opportunity, Recommended Actions |

### Data Flow
1. **Map Sync** – Cron-driven Notion export hydrates `competitor-definition-map.json` (CLI artifact) and shares with Codex for governance.
2. **Agent Sweep** – Each agent runs on an offset schedule (see `agents.md`) covering content fetch, diffing, semantic tagging, and anomaly detection.
3. **Signal Fusion** – Signals land in the Competitive Intelligence Engine (TypeScript module) where they are deduplicated, enriched with client context, and assigned severity & confidence.
4. **Reflex Trigger** – High-grade deltas fire Reflex workflows which spawn Teamwork tasks with embedded Charter briefs.
5. **Portal Refresh** – Processed deltas sink into Client Portal widgets (Notion collections + KPI overlays) and codified into Codex entries for audit.

### Implementation Notes
- **Storage** – Use Notion databases (`Competitor Registry`, `Intelligence Log`, `Portal Views`) + encrypted JSON artifacts for agent pipelines.
- **Execution** – Agents run via MCP server hooks; each agent exposes `plan`, `collect`, `diff`, `publish` actions.
- **Confidence Scoring** – Weighted by data freshness, source reliability, diff magnitude, historical accuracy, and multi-agent agreement.
- **Governance** – Every delta carries Custodian Hash (custodian + timestamp + SHA256 of payload) for traceability.
- **Safety Rails** – Rate limit crawlers, respect robots.txt, throttle API usage, honor integration scopes.

### Deliverables for v1
1. Competitor Definition Map synced with current Client Matrix.
2. Agent Hub configuration (`agents.md`) with triggers, contracts, governance hooks.
3. Competitive Intelligence Engine module with ingestion, enrichment, scoring, and Teamwork reflex hooks.
4. Client Portal embeddings: Competitor Intelligence Tab (table + radar), Industry Trend Watch, Risk Alerts, Revenue Impact overlay.
5. Charter-standard operational checklist (included at bottom of this doc).

### Charter Checklist
- [x] External surveillance organ defined.
- [x] Assignment logic + governance embedded.
- [x] Reflex routing → Teamwork tasks.
- [x] Client Portal gets consumable outputs.
- [x] Custodian visibility + audit trails.
- [x] Confidence scoring & risk triage encoded.
