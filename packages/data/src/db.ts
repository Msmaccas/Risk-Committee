import fs from 'fs';
import path from 'path';

// Data structures stored in the JSON database file.  When DATABASE_URL is
// ':memory:' or undefined, the data is kept in memory only.
interface DatabaseState {
  proposals: Array<{ id: string; symbol: string; desiredQuantity: number; rationale?: string; metadata?: any }>;
  positions: Array<{ symbol: string; quantity: number; costBasis: number; entryDate: string }>;
  decisions: Array<{ proposalId: string; decision: string; memo: string; artifacts: any; timestamp: string }>;
}

let state: DatabaseState = { proposals: [], positions: [], decisions: [] };
let persistentPath: string | null = null;
let initialised = false;

/**
 * Initialise the database state.  If DATABASE_URL is provided and not
 * ':memory:', it is interpreted as a path to a JSON file.  The file is
 * loaded if it exists; otherwise it is created on first write.  This
 * function must be idempotent.
 */
function init(): void {
  if (initialised) return;
  const url = process.env.DATABASE_URL || ':memory:';
  if (url !== ':memory:') {
    persistentPath = path.resolve(url);
    if (fs.existsSync(persistentPath)) {
      try {
        const content = fs.readFileSync(persistentPath, 'utf8');
        const parsed = JSON.parse(content);
        state = {
          proposals: Array.isArray(parsed.proposals) ? parsed.proposals : [],
          positions: Array.isArray(parsed.positions) ? parsed.positions : [],
          decisions: Array.isArray(parsed.decisions) ? parsed.decisions : []
        };
      } catch (err) {
        console.warn('Failed to parse existing database file; starting fresh.', err);
        state = { proposals: [], positions: [], decisions: [] };
      }
    } else {
      state = { proposals: [], positions: [], decisions: [] };
    }
  } else {
    persistentPath = null;
    state = { proposals: [], positions: [], decisions: [] };
  }
  initialised = true;
}

function save(): void {
  if (persistentPath) {
    const data = JSON.stringify(state, null, 2);
    fs.writeFileSync(persistentPath, data, 'utf8');
  }
}

// Helper to insert or update a proposal
export function upsertProposal(proposal: { id: string; symbol: string; desiredQuantity: number; rationale?: string; metadata?: any }): void {
  init();
  const idx = state.proposals.findIndex(p => p.id === proposal.id);
  if (idx >= 0) {
    state.proposals[idx] = { ...state.proposals[idx], ...proposal };
  } else {
    state.proposals.push({ ...proposal });
  }
  save();
}

// Helper to insert or update a position
export function upsertPosition(position: { symbol: string; quantity: number; costBasis: number; entryDate: string }): void {
  init();
  const idx = state.positions.findIndex(p => p.symbol === position.symbol);
  if (idx >= 0) {
    state.positions[idx] = { ...state.positions[idx], ...position };
  } else {
    state.positions.push({ ...position });
  }
  save();
}

// Helper to insert a committee decision
export function insertDecision(decision: { proposalId: string; decision: string; memo: string; artifacts: any; timestamp: string }): void {
  init();
  state.decisions.push({ ...decision });
  save();
}

// Fetch proposals that have not yet been decided
export function fetchPendingProposals(): Array<{ id: string; symbol: string; desiredQuantity: number; rationale?: string; metadata?: any }> {
  init();
  const decidedIds = new Set(state.decisions.map(d => d.proposalId));
  return state.proposals.filter(p => !decidedIds.has(p.id));
}

// Fetch all positions
export function fetchPositions(): Array<{ symbol: string; quantity: number; costBasis: number; entryDate: string }> {
  init();
  return [...state.positions];
}

// Fetch all decisions
export function fetchDecisions(): Array<{ proposalId: string; decision: string; memo: string; artifacts: any; timestamp: string }> {
  init();
  return [...state.decisions];
}
