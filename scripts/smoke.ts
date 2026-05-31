import { seedDatabaseFromFixtures } from '../packages/data/src/fixtures';
import { fetchPendingProposals, fetchPositions, insertDecision, fetchDecisions } from '../packages/data/src/db';
import { createMockProvider } from '../packages/providers/src/index';
import { runCommittee } from '../packages/workflows/src/index';

/**
 * Smoke script that seeds the database from JSON fixtures, runs the risk
 * committee on all pending proposals and prints the resulting decisions.  It
 * demonstrates the full flow of the application in a paper‑only setting.
 */
async function main(): Promise<void> {
  // Use an in‑memory database if none specified
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = ':memory:';
  }
  // Load fixtures into the database
  seedDatabaseFromFixtures();
  const proposals = fetchPendingProposals();
  if (proposals.length === 0) {
    console.log('No proposals loaded from fixtures.');
    return;
  }
  const positions = fetchPositions();
  const provider = createMockProvider();
  const decisions = await runCommittee(proposals, positions, provider);
  // Persist decisions in the ledger
  decisions.forEach(dec => {
    insertDecision({
      proposalId: dec.proposalId,
      decision: dec.decision,
      memo: dec.memo,
      artifacts: dec.artifacts,
      timestamp: dec.timestamp
    });
  });
  // Print out decisions
  console.log('Committee decisions:');
  decisions.forEach(dec => {
    console.log(`${dec.proposalId}: ${dec.decision}`);
    console.log(dec.memo);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
