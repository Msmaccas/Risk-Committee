// @ts-nocheck
import { upsertProposal, fetchPendingProposals, upsertPosition, fetchPositions, fetchDecisions } from '../packages/data/src/db';

describe('data layer', () => {
  beforeEach(() => {
    // Ensure we use an in-memory database for tests
    process.env.DATABASE_URL = ':memory:';
  });

  test('proposal insertion and retrieval', () => {
    upsertProposal({ id: 'test1', symbol: 'ABC', desiredQuantity: 10, rationale: 'Test' });
    const proposals = fetchPendingProposals();
    expect(proposals.find(p => p.id === 'test1')).toBeDefined();
  });

  test('position insertion and retrieval', () => {
    upsertPosition({ symbol: 'XYZ', quantity: 5, costBasis: 100, entryDate: '2025-01-01' });
    const positions = fetchPositions();
    expect(positions.find(p => p.symbol === 'XYZ')).toBeDefined();
  });

  test('decisions initially empty', () => {
    const decisions = fetchDecisions();
    expect(decisions.length).toBe(0);
  });
});
