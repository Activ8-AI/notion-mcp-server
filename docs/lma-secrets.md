# LMA Secrets Layout

- `LMA_GITHUB_PAT` — limit to `lma/*` repositories.
- `LMA_NOTION_API_KEY` — scoped to the LMA vault only.
- Keep each tenant’s PAT/Notion pair isolated; never reuse across domains.
