export type CompetitorPriority = 'A' | 'B' | 'C'

export type AgentId =
  | 'surveillance_agent'
  | 'research_agent'
  | 'competitor_watch_agent'
  | 'web_crawler_agent'
  | 'signal_harvester_agent'
  | 'content_diff_agent'

export type DeltaType =
  | 'pricing_change'
  | 'sku_launch'
  | 'campaign_launch'
  | 'keyword_collision'
  | 'sentiment_shift'
  | 'messaging_shift'
  | 'feature_update'
  | 'regulatory_event'

export interface CompetitorProfile {
  competitorId: string
  clientId: string
  name: string
  priority: CompetitorPriority
  surfaces: Array<{
    surfaceId: string
    url: string
    tags: string[]
    volatilityScore: number
  }>
  watchwords: string[]
  revenueOverlap: number
  governanceTags: string[]
}

export interface AgentSignal {
  agentId: AgentId
  clientId: string
  competitorId: string
  deltaType: DeltaType
  severity: number
  confidence: number
  signalPayload: Record<string, unknown>
  capturedAt: string // ISO timestamp
  metadata?: {
    sourceUrl?: string
    snapshotUrl?: string
    selectorHash?: string
    sentimentScore?: number
  }
}

export interface GovernanceMeta {
  custodian: string
  hash: string
  policyRefs: string[]
}

export interface CharterBrief {
  summary: string
  marketImpact: string
  strategicImplication: string
  recommendedActions: string[]
  governanceNotes: string
  confidenceScore: number
  custodianHash: string
}

export interface ActionableDelta extends AgentSignal {
  competitorName: string
  clientName: string
  opportunityImpact: number
  riskLevel: 'red' | 'yellow' | 'green'
  nextActions: string[]
  governance: GovernanceMeta
  brief: CharterBrief
}

export interface TeamworkTaskPayload {
  title: string
  description: string
  projectId: string
  assigneeId: string
  priority: 1 | 2 | 3 | 4 | 5
  customFields?: Record<string, string | number | boolean>
  tags?: string[]
}

export interface PortalWidgetPayload {
  clientId: string
  competitorId: string
  deltaType: DeltaType
  severity: number
  confidence: number
  revenueImpact: number
  riskLevel: 'red' | 'yellow' | 'green'
  summary: string
  recommendations: string[]
  governanceHash: string
}

export interface WebAgentAdapter {
  id: AgentId
  supports(deltaType: DeltaType): boolean
  normalize(signal: AgentSignal): AgentSignal
}

export interface TeamworkClient {
  createTask(payload: TeamworkTaskPayload): Promise<string>
}

export interface PortalPublisher {
  publishDelta(payload: PortalWidgetPayload): Promise<void>
}

export interface ClientDirectory {
  resolveClientName(clientId: string): string
  resolveTeamworkProject(clientId: string): string
  resolveDefaultAssignee(clientId: string, deltaType: DeltaType): string
}
