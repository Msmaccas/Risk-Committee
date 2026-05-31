# Demo Guide

This guide walks through the smoke demonstration of **RiskCommittee**.  The demo does not require any broker credentials and runs entirely in paper mode.  It uses synthetic fixture data to show how proposals flow through the system and how the committee reaches decisions.

## 1. Prepare the environment

1. Clone or extract the repository into a clean directory.
2. Copy `.env.example` to `.env` and review the configuration.  Leave `BROKER_ENABLED=false` for the demo.
3. Install dependencies and build the project:

   ```bash
   npm ci
   npm run build
   ```

## 2. Seed the database

The smoke script seeds the local SQLite database with a watchlist, paper portfolio and risk shocks.  These fixtures live under `fixtures/raw` and include:

* `proposals.json` – candidate trades with symbols, desired position sizes and rationales.
* `portfolio.json` – the current paper portfolio with positions, sizes and entry prices.
* `risk_shocks.json` – simulated realised volatility, factor exposures and event risks.

You can inspect these files to understand the inputs.

## 3. Run the smoke script

Execute the smoke script from the project root:

```bash
npm run smoke
```

This script will:

1. Initialize the SQLite database (creating tables if needed).
2. Load the fixtures into the `proposals` and `positions` tables.
3. Run the worker once.  The worker invokes the internal agents on each proposal, produces a committee decision and updates the paper portfolio accordingly.
4. Generate a simple report summarising before‑and‑after portfolio exposures, each decision, the rationale and any degraded cases.  The report is printed to standard output.

Example output (truncated):

```
Loaded 3 proposals and 5 existing positions.
Processing proposal AAPL: advocate=ADD, risk manager=TRIM, concentration analyst=DEFER...
Final decision: TRIM (chair rationale: reduce exposure due to high sector concentration)
...
Paper portfolio updated.  New sector exposures: Tech 45%, Healthcare 15%, Energy 10%...
Report saved to reports/smoke-2026-05-31T15-00-00Z.json
```

## 4. Explore the dashboard

After running the smoke script, you can start the API server and web dashboard:

```bash
npm start
```

Then open your browser to `http://localhost:3000/`.  The dashboard provides:

* **Proposal queue:** shows proposals awaiting committee review.
* **Positions:** lists current paper positions and their exposures.
* **Concentration map:** visualises factor and sector concentrations.
* **Thesis clocks:** displays how long each position has been held and when it should be reviewed.
* **Decision trace:** lets you drill into a committee memo for any decision.

The UI is intentionally minimal in this release but demonstrates the key flows.

## 5. Next steps

* Modify the fixtures under `fixtures/raw` to test different scenarios (e.g. high volatility or concentrated portfolios).
* Implement your own provider modules in `packages/providers` to fetch real data from APIs.  Be sure to return `ProviderResult<T>` objects with appropriate states.
* Add new agents or rules in `packages/agents` and `packages/workflows`.

This demo proves that RiskCommittee can operate end‑to‑end with no broker integration.  For details about the product vision and competitor landscape, see `PRODUCT.md` and `research/benchmark_ladder.md`.