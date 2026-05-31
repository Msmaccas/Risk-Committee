# AGENTS: Operational Guide for RiskCommittee

This document describes how to work with the **RiskCommittee** monorepo.  It covers installation, building, testing, running the smoke demo, starting the application and enforcing hygiene.  It also sets out the criteria for calling the project complete.

## Installation

1. Clone the repository (or extract the distributed ZIP).
2. Make sure you are in a clean directory with no parent `node_modules` folder.
3. Install dependencies using the package lock:

   ```bash
   npm install --package-lock-only
   npm ci
   ```

   The `--package-lock-only` flag generates a `package-lock.json` if it doesn't exist.  `npm ci` then installs exactly the locked versions.  Do not use `npm install` without the lock file.

## Building

Run the TypeScript build across all packages:

```bash
npm run build
```

This uses project references (`tsconfig.json` and `tsconfig.base.json`) to compile each package into `dist/`.  Built JavaScript, declaration files and source maps are emitted only into `dist` directories.  No build artifacts live next to the source files.

## Testing

The test suite is implemented with Jest and covers core domain validation, provider degradation, agent decision logic, API contract and smoke report generation.  Run it with:

```bash
npm test
```

## Smoke demo

The smoke path seeds the database with sample proposals, positions and risk shocks, runs the worker once and prints a report summarising the decisions.  It demonstrates the end‑to‑end flow without any live trading.

```bash
npm run smoke
```

## Starting the application

To run the API server, worker and optional web dashboard:

```bash
npm start
```

The server listens on the port specified in `.env` (default `3001`).  The Next.js web app runs on the next free port (`3000` by default) and proxies API calls to the server.

## Hygiene checks

Repository hygiene is enforced by `scripts/check-repo-hygiene`.  This script uses `git ls-files` to inspect files that would be committed and fails if it finds:

* `node_modules`, `dist` or `.tsbuildinfo` files checked into source control.
* Build reports, screenshots, fake outputs or other generated artifacts adjacent to source.
* Secrets or `.env` files.
* Citation tokens or references that would not resolve outside this environment.

Run it with:

```bash
npm run hygiene
```

## Done criteria

A feature or pull request is complete when:

1. `npm ci && npm run build && npm test && npm run smoke && npm start` all succeed from a fresh clone with no pre‑existing artifacts.
2. All code paths handle missing, malformed or hostile data gracefully by returning downgraded results instead of throwing exceptions.
3. There are tests covering both the happy path and degraded scenarios (provider failure, invalid inputs, partial data, etc.).
4. The documentation and API routes match the implementation exactly.
5. No over‑claims are made about live trading readiness or financial performance.  The system remains paper‑only unless explicitly enabled via environment variables and is never marketed as a way to beat the market.

## Do‑not‑overclaim rules

* **No financial advice:** RiskCommittee is a research and risk governance tool.  It does not guarantee profits, nor does it replace professional judgement.
* **Paper‑only by default:** Execution occurs in a simulated portfolio until the user explicitly enables a broker connector.  Even then, the user must manually approve trades.
* **Explain limitations:** When features are not yet implemented (e.g. advanced factor models, real data feeds), document them clearly as limitations.

Following these guidelines ensures that RiskCommittee remains a trustworthy, evidence‑first tool for disciplined trading operations.