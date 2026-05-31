// @ts-nocheck
import { aggregateDecisions, riskManager } from '../packages/agents/src/index';
import { DecisionType, Proposal, PositionContext, EntityState } from '../packages/core/src/index';

describe('agent logic', () => {
  test('aggregateDecisions respects priority', () => {
    const artifacts = [
      { agent: 'A', decision: DecisionType.MONITOR, confidence: 0.5, rationale: '' },
      { agent: 'B', decision: DecisionType.DEFER, confidence: 0.5, rationale: '' },
      { agent: 'C', decision: DecisionType.ADD, confidence: 0.5, rationale: '' }
    ];
    const result = aggregateDecisions(artifacts as any);
    expect(result).toBe(DecisionType.DEFER);
  });

  test('risk manager defers on high volatility', async () => {
    const proposal: Proposal = { id: 'test', symbol: 'TEST', desiredQuantity: 1 };
    const context: PositionContext = {
      positions: [],
      realisedVolatility: {
        source: 'mock',
        providerTimestamp: new Date(),
        receivedTimestamp: new Date(),
        confidence: 0.9,
        state: EntityState.OK,
        warnings: [],
        schemaVersion: '1.0.0',
        data: 0.5
      },
      factorExposure: {
        source: 'mock',
        providerTimestamp: new Date(),
        receivedTimestamp: new Date(),
        confidence: 0.9,
        state: EntityState.OK,
        warnings: [],
        schemaVersion: '1.0.0',
        data: { growth: 1 }
      },
      sectorExposure: {
        source: 'mock',
        providerTimestamp: new Date(),
        receivedTimestamp: new Date(),
        confidence: 0.9,
        state: EntityState.NOT_AVAILABLE,
        warnings: ['not implemented'],
        schemaVersion: '1.0.0',
        missingReason: 'not implemented'
      },
      eventRisk: {
        source: 'mock',
        providerTimestamp: new Date(),
        receivedTimestamp: new Date(),
        confidence: 0.9,
        state: EntityState.OK,
        warnings: [],
        schemaVersion: '1.0.0',
        data: { none: 0.1 }
      },
      liquidity: {
        source: 'mock',
        providerTimestamp: new Date(),
        receivedTimestamp: new Date(),
        confidence: 0.9,
        state: EntityState.OK,
        warnings: [],
        schemaVersion: '1.0.0',
        data: { liquidity: 1 }
      }
    };
    const res = await riskManager(proposal, context);
    expect(res.decision).toBe(DecisionType.DEFER);
  });
});
