import { Proposal, AgentArtifact, DecisionType } from '../../core/src/index';

/**
 * Generates a human‑readable committee memo summarising the decision for a
 * proposal.  The memo includes the final decision, a concise explanation of
 * why the position should be added or not, a summary of each agent’s
 * rationale and any critical warnings.  This function is intentionally
 * lightweight—memos are plain text to facilitate review and archival.
 */
export function generateMemo(
  proposal: Proposal,
  decision: DecisionType,
  artifacts: AgentArtifact[]
): string {
  const lines: string[] = [];
  lines.push(`Proposal ${proposal.id} for ${proposal.symbol}`);
  lines.push(`Final decision: ${decision}`);
  lines.push('');
  lines.push('Agent rationales:');
  for (const art of artifacts) {
    lines.push(`- ${art.agent}: ${art.decision} – ${art.rationale}`);
  }
  // Provide a simple narrative depending on decision
  switch (decision) {
    case DecisionType.ADD:
      lines.push('The committee agrees to add the position to the paper portfolio.');
      break;
    case DecisionType.TRIM:
      lines.push('The committee will add the position but at a reduced size due to concentration.');
      break;
    case DecisionType.DEFER:
      lines.push('The committee defers the decision pending improved conditions.');
      break;
    case DecisionType.REJECT:
      lines.push('The committee rejects the proposal.');
      break;
    case DecisionType.MONITOR:
      lines.push('The committee opts to monitor the situation without taking action.');
      break;
    case DecisionType.ESCALATE:
      lines.push('The committee escalates the proposal for human approval.');
      break;
  }
  return lines.join('\n');
}
