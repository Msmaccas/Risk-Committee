import {
  fetchPendingProposals,
  fetchPositions,
  insertDecision
} from '../../data/src/db';
import { createMockProvider } from '../../providers/src/index';
import { runCommittee } from '../../workflows/src/index';

/**
 * Process pending proposals once.  If there are proposals, runs the
 * committee and persists the resulting decisions.
 */
async function processOnce(): Promise<void> {
  const proposals = fetchPendingProposals();
  if (proposals.length === 0) {
    return;
  }
  const positions = fetchPositions();
  const provider = createMockProvider();
  const decisions = await runCommittee(proposals, positions, provider);
  decisions.forEach(dec => {
    insertDecision({
      proposalId: dec.proposalId,
      decision: dec.decision,
      memo: dec.memo,
      artifacts: dec.artifacts,
      timestamp: dec.timestamp
    });
  });
  console.log(`Worker processed ${decisions.length} proposals.`);
}

/**
 * Starts the worker.  If the environment variable INTERVAL_MS is set to a
 * positive integer, the worker runs at that interval (in milliseconds).
 * Otherwise it runs once on startup.
 */
function startWorker(): void {
  const intervalStr = process.env.INTERVAL_MS;
  const interval = intervalStr ? parseInt(intervalStr, 10) : 0;
  if (interval && interval > 0) {
    setInterval(() => {
      processOnce().catch(err => console.error(err));
    }, interval);
    console.log(`Worker scheduled to run every ${interval}ms`);
  }
  // Always run immediately
  processOnce().catch(err => console.error(err));
}

if (require.main === module) {
  startWorker();
}

export { startWorker, processOnce };
