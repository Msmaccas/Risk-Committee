/**
 * Core domain models and enums for RiskCommittee.
 */

/**
 * Explicit states for provider results and internal entities.
 */
export enum EntityState {
  UNKNOWN = "UNKNOWN",
  NOT_AVAILABLE = "NOT_AVAILABLE",
  LOW_CONFIDENCE = "LOW_CONFIDENCE",
  MANUAL_REVIEW = "MANUAL_REVIEW",
  OK = "OK"
}

/**
 * Generic result returned by providers.  All providers must return this structure
 * instead of throwing exceptions.  The generic parameter `T` contains the
 * normalized result payload when `state` is `OK`.
 */
export interface ProviderResult<T> {
  source: string;                // e.g. "VolatilityProvider"
  providerTimestamp: Date;       // when the provider produced the data
  receivedTimestamp: Date;       // when we received it
  confidence: number | null;     // optional confidence score between 0 and 1
  state: EntityState;            // explicit state of the data
  warnings?: string[];           // non-fatal issues encountered
  schemaVersion: string;         // version of the provider's output schema
  missingReason?: string;        // reason for missing or degraded data
  data?: T;                      // the actual payload when state === OK
}

/**
 * Possible committee decisions for a proposal.
 */
export enum DecisionType {
  ADD = "ADD",
  TRIM = "TRIM",
  DEFER = "DEFER",
  REJECT = "REJECT",
  MONITOR = "MONITOR",
  ESCALATE = "ESCALATE"
}

/**
 * A trading proposal submitted to the committee.  Each proposal references a
 * security (symbol), desired quantity (positive for long, negative for short),
 * and an optional rationale.  Additional metadata may be supplied via the
 * `metadata` field.
 */
export interface Proposal {
  id: string;
  symbol: string;
  desiredQuantity: number;
  rationale?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Context about an existing position in the paper portfolio.
 */
export interface Position {
  symbol: string;
  quantity: number;
  costBasis: number;        // average entry price
  entryDate: string;        // ISO date string
}

/**
 * Portfolio context information used by agents to assess a proposal.  This
 * includes realised volatility, factor exposures, sector exposures and event
 * risks for the overall portfolio.
 */
export interface PositionContext {
  positions: Position[];
  realisedVolatility: ProviderResult<number>;
  factorExposure: ProviderResult<Record<string, number>>;
  sectorExposure: ProviderResult<Record<string, number>>;
  eventRisk: ProviderResult<Record<string, number>>;
  liquidity: ProviderResult<Record<string, number>>;
}

/**
 * Output from a committee agent.  Each agent returns an artifact containing
 * their decision, rationale, confidence and optional critiques.
 */
export interface AgentArtifact {
  agent: string;
  decision: DecisionType;
  confidence: number;
  rationale: string;
  critiques?: string[];
  nextAction?: string;
}

/**
 * Final decision produced by the committee.  Includes the aggregated
 * information from all agents, the chosen decision and a memo.
 */
export interface CommitteeDecision {
  proposalId: string;
  decision: DecisionType;
  memo: string;
  artifacts: AgentArtifact[];
  timestamp: string;     // ISO timestamp of the decision
}

/**
 * Helper to create an empty ProviderResult with a given state and reason.
 */
export function createMissingResult<T>(
  source: string,
  state: EntityState,
  reason: string
): ProviderResult<T> {
  return {
    source,
    providerTimestamp: new Date(),
    receivedTimestamp: new Date(),
    confidence: null,
    state,
    warnings: [reason],
    schemaVersion: "1.0.0",
    missingReason: reason
  };
}