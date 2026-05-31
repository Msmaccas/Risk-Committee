# RiskCommittee

**RiskCommittee** is a TypeScript‑first monorepo for building a disciplined, paper‑only portfolio risk committee.  It simulates a trading desk committee: proposals flow from upstream scanners or manual input; internal agents debate each idea; and a chair synthesises a decision with full rationale.  The system records every decision in a ledger so you can revisit what happened later.  By default, the product runs entirely on a paper portfolio.  Optional broker integrations are disabled until explicitly enabled via environment variables.

## Repository layout

```
├── apps/web            # Next.js dashboard
├── packages/core       # Domain models and shared types
├── packages/data       # Data ingestion, DB wrappers and fixtures
├── packages/providers  # External data providers and their result types
├── packages/agents     # Internal committee agents
├── packages/workflows  # Orchestration and rule engine
├── packages/reports    # Report generation utilities
├── packages/server     # REST API server
├── packages/worker     # Background worker processing proposals
├── scripts             # Helper scripts (smoke test, hygiene checker)
├── fixtures            # Raw, hostile and golden fixture data
├── tests               # Jest test suite
└── docs                # Product, demo and pricing documentation
```

## Getting started

1. **Install dependencies**

   ```bash
   npm install --package-lock-only
   npm ci
   ```

2. **Copy the environment file**

   ```bash
   cp .env.example .env
   # edit .env if you want to change ports or enable brokers
   ```

3. **Build the project**

   ```bash
   npm run build
   ```

4. **Run the test suite**

   ```bash
   npm test
   ```

5. **Run the smoke demo**

   The smoke demo seeds the database with sample proposals and positions, runs the worker once, and prints a summary report.  This demonstrates the complete proposal‑to‑decision pipeline without any live trading.

   ```bash
   npm run smoke
   ```

6. **Start the server and web app**

   ```bash
   npm start
   ```

   The API server runs on the port specified by `PORT` in `.env` (default `3001`).  The Next.js web app runs on the next free port (`3000` by default).  You can browse the dashboard at `http://localhost:3000/`.

## Development notes

* **Strict TypeScript:** All packages compile with `noImplicitAny` and `strict` options.  Do not bypass the type system.
* **Composite builds:** Each package has its own `tsconfig.json` with `composite` enabled.  The root `tsconfig.json` uses project references to build all packages.
* **Provider results:** Every data provider returns a `ProviderResult<T>` that includes a source, timestamps, confidence, explicit state and warnings.  Do not throw exceptions for missing or malformed data; instead return a downgraded result with `state` set to `UNKNOWN`, `NOT_AVAILABLE` or `LOW_CONFIDENCE` as appropriate.
* **Agents return artifacts:** Committee agents never return bare strings.  They produce typed artifacts containing rationale, critiques, confidence changes and next actions.
* **Paper trading only:** Until a broker integration is explicitly enabled via environment variables, all execution occurs on the paper portfolio.  The worker updates positions in the local database but does not place real orders.

## Limitations

This initial implementation focuses on demonstrating the architecture and end‑to‑end flow.  It does not yet include a sophisticated risk model, advanced factor calculations or real broker connectivity.  Data providers use synthetic fixtures.  The UI is intentionally minimal.

See `PRODUCT.md` for the high‑level product vision and `research/benchmark_ladder.md` for competitor analysis.