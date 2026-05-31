import { Proposal, Position, CommitteeDecision, PositionContext, EntityState } from '../../core/src/index';
import { MarketDataProvider } from '../../providers/src/index';
import {
  ideaAdvocate,
  riskManager,
  concentrationAnalyst,
  eventHawk,
  sceptic,
  aggregateDecisions
} from '../../agents/src/index';
import { generateMemo } from '../../reports/src/index';
import { createMissingResult } from '../../core/src/index';

/**
 * Runs the full committee workflow for a batch of proposals.  It collects
 * portfolio context via the provided market data provider, invokes all
 * committee agents on each proposal and synthesises a final decision and
 * memo.  No state is persisted here; callers are responsible for writing
 * decisions to a database.
 */
export async function runCommittee(
  proposals: Proposal[],
  positions: Position[],
  provider: MarketDataProvider
): Promise<CommitteeDecision[]> {
  const decisions: CommitteeDecision[] = [];
  for (const proposal of proposals) {
    const context = await buildContext(proposal.symbol, positions, provider);
    const artifacts = await Promise.all([
      ideaAdvocate(proposal, context),
      riskManager(proposal, context),
      concentrationAnalyst(proposal, context),
      eventHawk(proposal, context),
      sceptic(proposal, context)
    ]);
    const finalDecision = aggregateDecisions(artifacts);
    const memo = generateMemo(proposal, finalDecision, artifacts);
    decisions.push({
      proposalId: proposal.id,
      decision: finalDecision,
      memo,
      artifacts,
      timestamp: new Date().toISOString()
    });
  }
  return decisions;
}

/**
 * Constructs a position context for a given symbol.  It queries the
 * provider for volatility, factor exposures, event risks and liquidity.  It
 * also provides placeholder values for sector exposure until implemented.
 */
async function buildContext(
  symbol: string,
  positions: Position[],
  provider: MarketDataProvider
): Promise<PositionContext> {
  const [vol, factor, eventRisk, liquidity] = await Promise.all([
    provider.getVolatility(symbol),
    provider.getFactorExposure(symbol),
    provider.getEventRisk(symbol),
    provider.getLiquidity(symbol)
  ]);
  // Convert provider outputs into the shapes expected by PositionContext
  const realisedVolatility = convertNumberResult(vol, v => v.volatility);
  const factorExposure = convertMapResult(factor, f => f.exposures);
  const eventRiskMap = convertMapResult(eventRisk, e => {
    const map: Record<string, number> = {};
    if (e.events && e.events.length > 0) {
      // assign uniform risk to each event
      e.events.forEach(evt => (map[evt] = e.riskScore));
    } else {
      map['none'] = e.riskScore;
    }
    return map;
  });
  const liquidityMap = convertMapResult(liquidity, l => ({ liquidity: l.score }));
  const sectorExposure = createMissingResult<Record<string, number>>(
    'SectorExposure',
    EntityState.NOT_AVAILABLE,
    'Sector exposure not implemented'
  );
  return {
    positions,
    realisedVolatility,
    factorExposure,
    sectorExposure,
    eventRisk: eventRiskMap,
    liquidity: liquidityMap
  };
}

function convertNumberResult<S, T>(
  result: import('../../core/src/index').ProviderResult<S>,
  selector: (s: S) => number
): import('../../core/src/index').ProviderResult<number> {
  if (result.state !== EntityState.OK || !result.data) {
    return {
      source: result.source,
      providerTimestamp: result.providerTimestamp,
      receivedTimestamp: result.receivedTimestamp,
      confidence: result.confidence,
      state: result.state,
      warnings: result.warnings,
      schemaVersion: result.schemaVersion,
      missingReason: result.missingReason
    };
  }
  return {
    source: result.source,
    providerTimestamp: result.providerTimestamp,
    receivedTimestamp: result.receivedTimestamp,
    confidence: result.confidence,
    state: result.state,
    warnings: result.warnings,
    schemaVersion: result.schemaVersion,
    data: selector(result.data)
  };
}

function convertMapResult<S, T>(
  result: import('../../core/src/index').ProviderResult<S>,
  selector: (s: S) => Record<string, number>
): import('../../core/src/index').ProviderResult<Record<string, number>> {
  if (result.state !== EntityState.OK || !result.data) {
    return {
      source: result.source,
      providerTimestamp: result.providerTimestamp,
      receivedTimestamp: result.receivedTimestamp,
      confidence: result.confidence,
      state: result.state,
      warnings: result.warnings,
      schemaVersion: result.schemaVersion,
      missingReason: result.missingReason
    };
  }
  return {
    source: result.source,
    providerTimestamp: result.providerTimestamp,
    receivedTimestamp: result.receivedTimestamp,
    confidence: result.confidence,
    state: result.state,
    warnings: result.warnings,
    schemaVersion: result.schemaVersion,
    data: selector(result.data)
  };
}
