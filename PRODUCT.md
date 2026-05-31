# Product Overview: RiskCommittee

## Broad field

Finance technology (FinTech).

## Subfield

AI‑driven portfolio management and risk governance.

## Specialized niche

An AI‑powered paper‑trade portfolio risk committee that evaluates proposals from scanners or manual analysts, models portfolio risk exposures (factor, sector, correlation and event risk) and produces portfolio‑level decisions (add, trim, defer, reject, monitor or human‑escalate). The system emphasises explanation quality, persistent decision logs and strict paper‑only execution by default.

## Job to be done

Enable solo operators and small funds to apply the discipline of an institutional trading desk’s risk committee without building internal infrastructure.  RiskCommittee ingests candidate trades, current portfolio context, realized volatility, factor and sector concentration, upcoming events and user constraints.  A team of internal agents (idea advocate, risk manager, concentration analyst, event hawk, sceptic and portfolio chair) debates each proposal and produces a committee memo and decision.  The app maintains a persistent ledger so past decisions can be revisited against actual outcomes.  It acts as a gatekeeper: trades are paper‑executed only after passing committee approval.

## Core promise

Deliver institutional‑grade risk oversight and explanation to algorithmic or discretionary traders.  Instead of surfacing hot signals without context, RiskCommittee provides a portfolio‑level view of why a position deserves capital, where it correlates with existing exposure, what could go wrong, and the exact conditions under which it will be reviewed or killed.  All decisions are recorded, and the product remains paper‑only until a future explicit broker integration is enabled.

## Target user

Solo operators, small hedge funds, prop‑trading pods and risk‑conscious traders who want disciplined internal controls for AI‑driven or systematic strategies.  Users may operate in any region but this documentation assumes Asia/Singapore time; all dates in examples are relative to that locale.

## Maturity target

The initial release aims for a beta‑level product suitable for real user testing.  It must include a web dashboard (proposal queue, open positions, concentration maps, thesis clocks and vote trace), a REST API, a worker and scheduler, a local database and a rule engine.  Optional broker integrations must remain disabled in smoke mode and gated behind explicit approval.  The architecture must be robust enough to plug in live brokers later but still valuable with CSV or fixture imports.

## Why this should exist

Recent advances in AI trading have produced multi‑agent frameworks, research‑to‑live engines and agentic brokerage surfaces.  Many of these focus on alpha discovery and execution, not on portfolio‑level judgment, approval logic or explanation quality.  Regulators and serious operators require audit trails and risk committees to guard against runaway AI.  RiskCommittee fills this gap by providing a disciplined, paper‑only risk governance layer that complements upstream scanners and downstream execution engines.  It brings transparency and accountability to AI‑generated trading ideas.

## First demo must prove

The smoke path must demonstrate that RiskCommittee can:

* Seed a watchlist, paper portfolio and synthetic risk shocks using fixtures.
* Ingest a list of candidate proposals (e.g. from a scanner or CSV import).
* Generate a portfolio context, including realized volatility, factor and sector exposures, liquidity quality and user constraints.
* Run an internal agent debate (idea advocate, risk manager, concentration analyst, event hawk, sceptic and portfolio chair) over each proposal.
* Produce committee decisions (add, trim, defer, reject, monitor, or human‑escalate) with concise memos explaining rationale and kill conditions.
* Update the paper portfolio positions and concentration maps accordingly.
* Record the decision and rationale in a persistent ledger for later review.
* Generate a smoke report summarising before/after portfolio exposures, decisions made, any degraded cases and where human intervention was required.

If optional broker connectors are configured, the user must explicitly enable them; otherwise all execution remains paper‑only.  The first demo should show value even without any broker connection.