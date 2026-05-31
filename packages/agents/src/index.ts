import { Proposal, PositionContext, AgentArtifact, DecisionType } from '../../core/src/index';
import { MarketDataProvider } from '../../providers/src/index';

/**
 * Agent: Idea Advocate
 * The advocate argues in favour of adding the proposed position.  It uses the
 * proposal rationale and provides a moderate confidence unless the rationale
 * is missing.
 */
export async function ideaAdvocate(proposal: Proposal, context: PositionContext): Promise<AgentArtifact> {
  const confidence = proposal.rationale ? 0.7 : 0.5;
  const rationale = proposal.rationale ?? 'No stated rationale; advocating based on generic optimism.';
  return {
    agent: 'IdeaAdvocate',
    decision: DecisionType.ADD,
    confidence,
    rationale,
    critiques: [],
    nextAction: 'Proceed to risk manager evaluation'
  };
}

/**
 * Agent: Risk Manager
 * Evaluates volatility and event risk.  If realised volatility is high or
 * event risk is elevated, recommends deferral; otherwise proposes adding.
 */
export async function riskManager(proposal: Proposal, context: PositionContext): Promise<AgentArtifact> {
  const vol = context.realisedVolatility.data;
  const volVal = typeof vol === 'number' ? vol : null;
  const eventMap = context.eventRisk.data as Record<string, number> | undefined;
  const eventRisk = eventMap
    ? Object.values(eventMap).reduce((max, val) => (val > max ? val : max), 0)
    : 0;
  let decision = DecisionType.ADD;
  let rationale = 'Volatility and event risk within acceptable limits.';
  if (volVal !== null && volVal > 0.4) {
    decision = DecisionType.DEFER;
    rationale = `Realised volatility ${volVal.toFixed(2)} exceeds risk threshold.`;
  }
  if (eventRisk > 0.5) {
    decision = DecisionType.DEFER;
    rationale = `Upcoming event risk score ${eventRisk.toFixed(2)} indicates elevated risk.`;
  }
  return {
    agent: 'RiskManager',
    decision,
    confidence: 0.8,
    rationale,
    critiques: [],
    nextAction: decision === DecisionType.ADD ? 'Proceed to concentration analysis' : 'Await conditions normalisation'
  };
}

/**
 * Agent: Concentration Analyst
 * Looks at current factor exposures to identify concentration.  If any factor
 * exposure exceeds 1.5, suggests trimming or rejection; otherwise passes.
 */
export async function concentrationAnalyst(proposal: Proposal, context: PositionContext): Promise<AgentArtifact> {
  const exposures = context.factorExposure.data as Record<string, number> | undefined;
  let decision: DecisionType = DecisionType.ADD;
  let rationale = 'Factor exposures are balanced.';
  if (exposures) {
    for (const [factor, value] of Object.entries(exposures)) {
      if (value > 1.5) {
        decision = DecisionType.TRIM;
        rationale = `High exposure to factor ${factor} (${value.toFixed(2)}).`;
        break;
      }
    }
  }
  return {
    agent: 'ConcentrationAnalyst',
    decision,
    confidence: 0.7,
    rationale,
    critiques: [],
    nextAction: decision === DecisionType.ADD ? 'Proceed to event analysis' : 'Reduce proposed sizing'
  };
}

/**
 * Agent: Event Hawk
 * Monitors upcoming events for the proposed symbol.  If events exist,
 * recommends monitoring or deferral.
 */
export async function eventHawk(proposal: Proposal, context: PositionContext): Promise<AgentArtifact> {
  const riskMap = context.eventRisk.data as Record<string, number> | undefined;
  let decision: DecisionType = DecisionType.ADD;
  let rationale = 'No material upcoming events.';
  if (riskMap) {
    // If there are keys other than 'none', treat those as events
    const events = Object.keys(riskMap).filter(key => key !== 'none');
    if (events.length > 0) {
      decision = DecisionType.MONITOR;
      rationale = `Upcoming events detected: ${events.join(', ')}.`;
    }
  }
  return {
    agent: 'EventHawk',
    decision,
    confidence: 0.6,
    rationale,
    critiques: [],
    nextAction: decision === DecisionType.ADD ? 'No further event concerns' : 'Monitor events closely'
  };
}

/**
 * Agent: Sceptic
 * Provides a conservative perspective.  With a low probability, it suggests
 * rejection; otherwise monitors.
 */
export async function sceptic(proposal: Proposal, context: PositionContext): Promise<AgentArtifact> {
  const rand = Math.random();
  let decision = DecisionType.MONITOR;
  let rationale = 'No critical concerns, but maintaining scepticism.';
  if (rand < 0.1) {
    decision = DecisionType.REJECT;
    rationale = 'Sceptic agent rejects based on lack of conviction.';
  }
  return {
    agent: 'Sceptic',
    decision,
    confidence: 0.5,
    rationale,
    critiques: [],
    nextAction: 'Consider alternate ideas'
  };
}

/**
 * Aggregates agent decisions to produce a final decision.  This simple
 * aggregation uses precedence: REJECT > DEFER > TRIM > MONITOR > ADD.
 */
export function aggregateDecisions(artifacts: AgentArtifact[]): DecisionType {
  const priority: DecisionType[] = [
    DecisionType.REJECT,
    DecisionType.DEFER,
    DecisionType.TRIM,
    DecisionType.MONITOR,
    DecisionType.ADD
  ];
  for (const dec of priority) {
    if (artifacts.some(a => a.decision === dec)) {
      return dec;
    }
  }
  return DecisionType.ADD;
}
