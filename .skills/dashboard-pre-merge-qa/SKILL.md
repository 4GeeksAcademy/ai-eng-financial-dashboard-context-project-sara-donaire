---
name: dashboard-pre-merge-qa
description: Pre-merge QA for this financial dashboard repo. Use before opening or updating a pull request, or when asked to "check this branch", "is it ready to merge" or "run QA".
---

# Dashboard pre-merge QA

## Objective

Decide whether the current branch of this repo can be merged, using the checks this repo actually supports, and produce a short report the reviewer can trust. The agent runs the checks and reports evidence; it does not fix code while running this skill.

## Inputs

- The branch to check (default: current branch) and its base (`main`).
- The output of `git diff --stat main...HEAD`, to know which areas changed: `frontend/`, `backend/`, docs, `.agents/`, `.skills/`, `memory-bank/`.
- Optional: the PR description, to compare what it claims against what the checks show.

## Steps

1. **Scope.** Run `git status --short` (must be empty) and `git diff --stat main...HEAD`. List the changed areas.
2. **Frontend checks** (only if `frontend/` changed). From `frontend/`, run in this order:
   - `npm test` (Vitest, `src/lib/financial-utils.test.ts`)
   - `npm run lint`
   - `npm run build` (`tsc -b && vite build`)
   - If `npm` fails with `EACCES` on `node_modules`, the folder was created by Docker as root. Fix with `sudo chown -R $(whoami) node_modules`, then `npm install`. Report it; it is an environment issue, not a code failure.
3. **Build warnings.** Compare the build output with `main`. The only accepted warning is none: the >500 kB chunk warning was removed by lazy-loading the Recharts charts in `App.tsx`. Any new warning needs a written reason in the PR.
4. **Backend checks** (only if `backend/` changed). From `backend/`, run `pytest`. New endpoints or filters need tests in `backend/tests/test_routes.py`.
5. **Runtime check.** From the repo root, `docker compose up --build`, open port 5173 and confirm:
   - KPI cards show numbers, not `—`.
   - Both charts render after their skeletons; the page does not jump when they load.
   - With the backend stopped, the red error box appears (it has `role="alert"`).
   - Tab moves through the page in visual order; chart titles are `h2` under the single `h1`.
   If `/api` calls fail inside Compose, note it as "runtime not verified" with the reason. Never mark it as passed.
6. **Repo-specific traps.** Flag any of these in the diff:
   - Next.js-only APIs (`next/image`, `next/font`, `next/dynamic`, server actions). This is React + Vite.
   - New calls to API endpoints without updating `memory-bank/` (the dashboard only consumes `/api/metrics`).
   - Hardcoded period labels (the header still says `2024 - Full Year` while the backend dates come from `date.today()`).
   - Text in a language other than English (`index.html` declares `lang="en"`).
   - Removing `noindex` from `index.html` or `public/robots.txt`. The dashboard shows company financials and must not be indexed.
7. **Traceability.** Each commit message names the skill or rule it applies (for example `accessibility`, `vercel-react-best-practices`, `seo`). List commits that don't.

## Expected output

A report in this exact shape, pasted into the PR description or the chat:

```
QA: <branch> -> main
Changed areas: <list>
Frontend: test <pass/fail/skipped> | lint <...> | build <...> | new warnings: <none/list>
Backend: pytest <pass/fail/skipped (no backend changes)>
Runtime: <verified / not verified: reason>
Repo traps: <none / list with file:line>
Untraceable commits: <none / list>
Verdict: READY / NOT READY (<one-line reason>)
```

## Acceptance criteria

- Every line of the report comes from a command run in this session, or says "skipped" or "not verified" with a reason.
- Skipped checks match the changed areas from step 1. Frontend changes never skip the build.
- "READY" only when test, lint and build pass, there are no unexplained new warnings and no repo traps.
- The agent changed no files while running this skill.
