import { createHash } from 'node:crypto'

import {
  ActionableDelta,
  AgentSignal,
  CharterBrief,
  ClientDirectory,
  CompetitorProfile,
  GovernanceMeta,
  PortalPublisher,
  PortalWidgetPayload,
  TeamworkClient,
  TeamworkTaskPayload,
  WebAgentAdapter,
} from './types'

export interface ProcessStats {
  processed: number
  escalated: number
  suppressed: number
}

export class CompetitiveIntelligenceEngine {
  private readonly competitorMap = new Map<string, CompetitorProfile>()
  private readonly queue: AgentSignal[] = []
  private readonly adapters = new Map<string, WebAgentAdapter>()

  constructor(
    private readonly clientDirectory: ClientDirectory,
    private readonly teamworkClient: TeamworkClient,
    private readonly portalPublisher: PortalPublisher,
    private readonly severityFloor = 0.2,
  ) {}

  ingestCompetitorProfiles(profiles: CompetitorProfile[]): void {
    profiles.forEach(profile => {
      const key = this.getCompetitorKey(profile.clientId, profile.competitorId)
      this.competitorMap.set(key, profile)
    })
  }

  registerAgent(adapter: WebAgentAdapter): void {
    this.adapters.set(adapter.id, adapter)
  }

  enqueueSignal(signal: AgentSignal): void {
    const adapter = this.adapters.get(signal.agentId)
    const normalized = adapter ? adapter.normalize(signal) : signal
    this.queue.push(normalized)
  }

  async processQueue(): Promise<ProcessStats> {
    const stats: ProcessStats = { processed: 0, escalated: 0, suppressed: 0 }

    while (this.queue.length > 0) {
      const signal = this.queue.shift()
      if (!signal) {
        break
      }
      const delta = this.createDelta(signal)
      stats.processed += 1

      if (delta.severity < this.severityFloor) {
        stats.suppressed += 1
        continue
      }

      await this.routeToTeamwork(delta)
      await this.publishToPortal(delta)
      stats.escalated += 1
    }

    return stats
  }

  private createDelta(signal: AgentSignal): ActionableDelta {
    const profile = this.resolveProfile(signal.clientId, signal.competitorId)
    const clientName = this.clientDirectory.resolveClientName(signal.clientId)
    const governance = this.createGovernanceMeta(signal, profile)
    const riskLevel = this.calculateRiskLevel(signal.severity, signal.deltaType)

    return {
      ...signal,
      competitorName: profile.name,
      clientName,
      opportunityImpact: this.calculateOpportunityImpact(signal, profile),
      riskLevel,
      nextActions: this.deriveNextActions(signal.deltaType),
      governance,
      brief: this.createCharterBrief(signal, profile, governance),
    }
  }

  private resolveProfile(clientId: string, competitorId: string): CompetitorProfile {
    const key = this.getCompetitorKey(clientId, competitorId)
    const profile = this.competitorMap.get(key)
    if (!profile) {
      throw new Error(`Missing competitor profile for ${clientId}:${competitorId}`)
    }
    return profile
  }

  private getCompetitorKey(clientId: string, competitorId: string): string {
    return `${clientId}:${competitorId}`
  }

  private calculateOpportunityImpact(signal: AgentSignal, profile: CompetitorProfile): number {
    const priorityWeight = profile.priority === 'A' ? 1 : profile.priority === 'B' ? 0.7 : 0.4
    const overlapWeight = profile.revenueOverlap
    return Number((signal.severity * priorityWeight * overlapWeight).toFixed(2))
  }

  private calculateRiskLevel(severity: number, deltaType: AgentSignal['deltaType']): 'red' | 'yellow' | 'green' {
    if (deltaType === 'pricing_change' || deltaType === 'sku_launch') {
      if (severity >= 0.6) return 'red'
      if (severity >= 0.4) return 'yellow'
      return 'green'
    }

    if (severity >= 0.7) {
      return 'red'
    }
    if (severity >= 0.45) {
      return 'yellow'
    }
    return 'green'
  }

  private deriveNextActions(deltaType: AgentSignal['deltaType']): string[] {
    switch (deltaType) {
      case 'pricing_change':
        return ['Simulate revenue impact', 'Prepare pricing counterplay', 'Notify account lead']
      case 'campaign_launch':
        return ['Audit overlapping keywords', 'Update AdOps guardrails']
      case 'keyword_collision':
        return ['Refresh SEO defensive plan', 'Deploy PPC bid adjustments']
      case 'sentiment_shift':
        return ['Draft comms response', 'Sync with Client Portal sentiment widget']
      case 'feature_update':
        return ['Update product parity table', 'Assess roadmap implications']
      default:
        return ['Review delta with strategist']
    }
  }

  private createGovernanceMeta(signal: AgentSignal, profile: CompetitorProfile): GovernanceMeta {
    const hashPayload = JSON.stringify({
      agentId: signal.agentId,
      capturedAt: signal.capturedAt,
      clientId: signal.clientId,
      competitorId: signal.competitorId,
      payload: signal.signalPayload,
    })

    const hash = createHash('sha256').update(hashPayload).digest('hex')

    return {
      custodian: this.resolveCustodian(signal.agentId),
      hash,
      policyRefs: profile.governanceTags,
    }
  }

  private resolveCustodian(agentId: AgentSignal['agentId']): string {
    const mapping: Record<AgentSignal['agentId'], string> = {
      surveillance_agent: 'Sentinel',
      research_agent: 'Archivist',
      competitor_watch_agent: 'Observer',
      web_crawler_agent: 'CrawlerOps',
      signal_harvester_agent: 'Harvester',
      content_diff_agent: 'DiffControl',
    }
    return mapping[agentId]
  }

  private createCharterBrief(
    signal: AgentSignal,
    profile: CompetitorProfile,
    governance: GovernanceMeta,
  ): CharterBrief {
    return {
      summary: `${profile.name} triggered ${signal.deltaType} via ${signal.agentId}`,
      marketImpact: this.deriveMarketImpact(signal),
      strategicImplication: this.deriveStrategicImplication(signal.deltaType),
      recommendedActions: this.deriveNextActions(signal.deltaType),
      governanceNotes: `Policy refs ${governance.policyRefs.join(', ')} | Custodian ${governance.custodian}`,
      confidenceScore: signal.confidence,
      custodianHash: governance.hash,
    }
  }

  private deriveMarketImpact(signal: AgentSignal): string {
    const severityPercent = Math.round(signal.severity * 100)
    const confidencePercent = Math.round(signal.confidence * 100)
    return `Severity ${severityPercent}% with confidence ${confidencePercent}% on ${signal.deltaType}`
  }

  private deriveStrategicImplication(deltaType: AgentSignal['deltaType']): string {
    const mapping: Record<AgentSignal['deltaType'], string> = {
      pricing_change: 'Potential margin compression and revenue defense risk',
      sku_launch: 'Feature parity review and roadmap acceleration required',
      campaign_launch: 'Paid media pressure expected – review budget allocations',
      keyword_collision: 'Organic + paid overlap threatens share-of-voice',
      sentiment_shift: 'Brand perception drift – coordinate comms and CX',
      messaging_shift: 'Repositioning underway – validate value gap',
      feature_update: 'Product differentiation narrows – audit parity matrix',
      regulatory_event: 'Compliance-driven changes – legal review required',
    }
    return mapping[deltaType]
  }

  private async routeToTeamwork(delta: ActionableDelta): Promise<void> {
    const payload: TeamworkTaskPayload = {
      title: `[${delta.riskLevel.toUpperCase()}] ${delta.deltaType} – ${delta.competitorName}`,
      description: this.buildTaskDescription(delta),
      projectId: this.clientDirectory.resolveTeamworkProject(delta.clientId),
      assigneeId: this.clientDirectory.resolveDefaultAssignee(delta.clientId, delta.deltaType),
      priority: this.mapRiskToPriority(delta.riskLevel),
      tags: ['maos', 'competitive-intel', delta.deltaType],
      customFields: {
        confidence: delta.confidence,
        severity: delta.severity,
        governanceHash: delta.governance.hash,
      },
    }

    await this.teamworkClient.createTask(payload)
  }

  private buildTaskDescription(delta: ActionableDelta): string {
    return [
      `Client: ${delta.clientName}`,
      `Competitor: ${delta.competitorName}`,
      `Delta Type: ${delta.deltaType}`,
      `Severity: ${delta.severity}`,
      `Confidence: ${delta.confidence}`,
      `Summary: ${delta.brief.summary}`,
      `Market Impact: ${delta.brief.marketImpact}`,
      `Strategic Implication: ${delta.brief.strategicImplication}`,
      `Next Actions: ${delta.nextActions.join(' | ')}`,
      `Custodian Hash: ${delta.governance.hash}`,
    ].join('\n')
  }

  private mapRiskToPriority(risk: ActionableDelta['riskLevel']): 1 | 2 | 3 | 4 | 5 {
    if (risk === 'red') return 1
    if (risk === 'yellow') return 2
    return 3
  }

  private async publishToPortal(delta: ActionableDelta): Promise<void> {
    const payload: PortalWidgetPayload = {
      clientId: delta.clientId,
      competitorId: delta.competitorId,
      deltaType: delta.deltaType,
      severity: delta.severity,
      confidence: delta.confidence,
      revenueImpact: delta.opportunityImpact,
      riskLevel: delta.riskLevel,
      summary: delta.brief.summary,
      recommendations: delta.nextActions,
      governanceHash: delta.governance.hash,
    }

    await this.portalPublisher.publishDelta(payload)
  }
}
