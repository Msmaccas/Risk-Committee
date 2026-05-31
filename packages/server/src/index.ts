import http from 'http';
import { seedDatabaseFromFixtures } from '../../data/src/fixtures';
import {
  fetchPendingProposals,
  fetchPositions,
  fetchDecisions,
  insertDecision
} from '../../data/src/db';
import { createMockProvider } from '../../providers/src/index';
import { runCommittee } from '../../workflows/src/index';

/**
 * Creates an HTTP server exposing the RiskCommittee API.  The server
 * supports a minimal set of endpoints:
 *   GET /health        – returns { status: "ok" }
 *   GET /proposals     – returns pending proposals
 *   GET /positions     – returns current positions
 *   GET /decisions     – returns all decisions
 *   POST /process      – runs the committee on pending proposals
 */
export function createServer(): http.Server {
  // Optionally seed database on startup
  if (process.env.AUTO_SEED === 'true') {
    seedDatabaseFromFixtures();
  }
  return http.createServer(async (req, res) => {
    const url = req.url || '/';
    const method = req.method || 'GET';
    // Set common headers
    res.setHeader('Content-Type', 'application/json');
    try {
      if (method === 'GET' && url === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }
      if (method === 'GET' && url === '/proposals') {
        const proposals = fetchPendingProposals();
        res.writeHead(200);
        res.end(JSON.stringify(proposals));
        return;
      }
      if (method === 'GET' && url === '/positions') {
        const positions = fetchPositions();
        res.writeHead(200);
        res.end(JSON.stringify(positions));
        return;
      }
      if (method === 'GET' && url === '/decisions') {
        const decisions = fetchDecisions();
        res.writeHead(200);
        res.end(JSON.stringify(decisions));
        return;
      }
      if (method === 'POST' && url === '/process') {
        // Read body (not used here, reserved for future extensions)
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });
        req.on('end', async () => {
          const proposals = fetchPendingProposals();
          if (!proposals || proposals.length === 0) {
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'No pending proposals' }));
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
          res.writeHead(200);
          res.end(JSON.stringify(decisions));
        });
        return;
      }
      // Unknown route
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
}

// Start server if run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3000', 10);
  const server = createServer();
  server.listen(port, () => {
    console.log(`RiskCommittee API server listening on port ${port}`);
  });
}
