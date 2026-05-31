import fs from 'fs';
import path from 'path';
import { upsertProposal, upsertPosition } from './db';

/**
 * Seeds the database with proposals and positions from JSON fixtures.  It
 * resolves the `fixtures/raw` directory relative to the compiled output
 * location at runtime.  The fixtures contain arrays of proposals and
 * positions.  Invalid or missing files will result in no action.
 */
export function seedDatabaseFromFixtures(): void {
  try {
    // Resolve the fixtures directory relative to the compiled file
    const baseDir = path.resolve(__dirname, '../../../../fixtures/raw');
    const proposalsPath = path.join(baseDir, 'proposals.json');
    const positionsPath = path.join(baseDir, 'positions.json');
    if (fs.existsSync(proposalsPath)) {
      const content = fs.readFileSync(proposalsPath, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        data.forEach((p: any) => {
          if (p && p.id && p.symbol && typeof p.desiredQuantity === 'number') {
            upsertProposal({
              id: String(p.id),
              symbol: String(p.symbol),
              desiredQuantity: Number(p.desiredQuantity),
              rationale: p.rationale,
              metadata: p.metadata
            });
          }
        });
      }
    }
    if (fs.existsSync(positionsPath)) {
      const content = fs.readFileSync(positionsPath, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        data.forEach((pos: any) => {
          if (pos && pos.symbol && typeof pos.quantity === 'number') {
            upsertPosition({
              symbol: String(pos.symbol),
              quantity: Number(pos.quantity),
              costBasis: Number(pos.costBasis || 0),
              entryDate: String(pos.entryDate || new Date().toISOString())
            });
          }
        });
      }
    }
  } catch (err) {
    // Ignore fixture errors silently to avoid crashing the app
    console.warn('Failed to seed fixtures:', err);
  }
}
