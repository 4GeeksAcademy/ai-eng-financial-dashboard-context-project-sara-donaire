# Progress

Session log for `feature/agent-skills` (project "Enhancing development with agent skills"). Product, stack and known gaps live in `memory-bank/project.md`.

## Skills applied

| Skill | Source | Where | Commit |
| --- | --- | --- | --- |
| `accessibility` | addyosmani/web-quality-skills | `.agents/skills/accessibility` | `fix(a11y): apply accessibility skill …` |
| `vercel-react-best-practices` | vercel-labs/agent-skills | `.agents/skills/vercel-react-best-practices` | `perf: apply vercel-react-best-practices skill …` |
| `seo` (ecosystem pick) | addyosmani/web-quality-skills | `.agents/skills/seo` | `chore(seo): add and apply seo skill …` |
| `dashboard-pre-merge-qa` (internal) | this repo | `.skills/dashboard-pre-merge-qa` | `docs(skills): add internal dashboard-pre-merge-qa skill …` |

Both installed skills are listed in `skills-lock.json`.

## Verified changes

### accessibility

- `CardTitle` renders an `h2`; the page has one `h1` ("Financial Overview") and chart titles below it (`frontend/src/components/ui/card.tsx`).
- API error box has `role="alert"` (`frontend/src/App.tsx`).
- Each chart has a visually hidden data table with the monthly values, so screen readers get the numbers behind the lines (`income-outcome-chart.tsx`, `profit-percent-chart.tsx`).
- Loading states expose `role="status"` text; decorative skeletons are `aria-hidden` (`skeleton.tsx`, `kpi-row.tsx`, chart components).
- Contrast: the app always renders the `dark` theme (`<main className="dark …">`). WCAG ratios computed from the `.dark` tokens in `index.css`: lowest is muted text on cards, 5.17:1; KPI badge icons 6.17–6.88:1; body text on cards 15.77:1. All pass AA (4.5:1). Colors were not changed.
- Images and icons: the dashboard has no `<img>`. Lucide icons are decorative, sit next to a visible text label, and lucide-react renders them with `aria-hidden="true"` by default.
- Keyboard: the only focusable elements are the two charts (Recharts renders them with `tabindex="0"`); see the runtime check below.

### vercel-react-best-practices

- `bundle-dynamic-imports`: both Recharts charts load with `React.lazy` + `Suspense` (the Vite equivalent of `next/dynamic`). Main JS chunk went from 585 kB to 188 kB and the ">500 kB chunk" build warning is gone.
- Layout shift: the `Suspense` fallback is `ChartCardSkeleton`, the same size as a rendered chart card (header + 280 px plot), and the charts reuse it for their own loading state.
- Page metadata: `index.html` had `<title>frontend</title>`. Now it has a real title and a meta description.
- Rejected as not applicable: `next/image` (no images), `next/font` (no web font is loaded; `Inter` is only a CSS fallback name), all `server-*` rules (no SSR). `bundle-barrel-imports` not applied: Vite tree-shakes `lucide-react` in production, and the rule itself warns that its deep import paths have no types.

### seo

- Crawlability: this is an internal dashboard showing company financials, so it must not be indexed. Added `<meta name="robots" content="noindex, nofollow">` and `frontend/public/robots.txt` with `Disallow: /`.
- Language declaration: `index.html` declares `lang="en"` but the API error message was in Spanish. It is now in English.

## Ecosystem skill: why `seo`

Searched `npx skills find testing`, `npx skills find seo` and `npx skills find performance`.

- testing: top results were browser automation (`agent-browser`, `browser-use`), mobile (Expo, Flutter, Detox) and auth-provider testing (Clerk). None fits a Vite + FastAPI dashboard without adding new tooling.
- performance: the top hit was `vercel-react-best-practices`, already applied. The others target Supabase, Swift or Convex.
- seo: `addyosmani/web-quality-skills@seo` comes from the same publisher as the `accessibility` skill already in use, and its crawlability and language rules gave two concrete fixes in this repo. The install report showed Gen: Safe, Socket: 0 alerts, Snyk: Med Risk; the skill is Markdown instructions only (no scripts), and it was read before being applied.

## Internal skill: `dashboard-pre-merge-qa`

`.skills/dashboard-pre-merge-qa/SKILL.md` covers what community skills don't know about this repo: the exact test, lint, build and pytest commands, the build-warning baseline, the Compose runtime checks, the root-owned `node_modules` fix, and repo traps (Next.js-only APIs, the hardcoded `2024 - Full Year` label, `lang="en"`, `noindex`). It defines objective, inputs, expected output and acceptance criteria.

Run on this branch before opening the PR; the report is in the PR description.

## Check results on this branch

- Frontend: `npm test` 6 passed, `npm run lint` clean, `npm run build` passes with no warnings.
- Backend: `pytest` 16 passed (no backend changes in this branch).
- Runtime (Codespace, 22 Oct 2026): with `docker compose up --build`, the frontend container resolves `backend` but its `/api` requests time out, while the API answers 200 from the host. Verified instead through a temporary host Vite instance proxied to `localhost:8000` (not committed), as the internal skill now describes:
  - KPIs and both charts render with data; chart chunks load lazily; title, description, `lang="en"` and `noindex` are in the served HTML.
  - One `h1` and two `h2`; each hidden data table has 12 rows.
  - Keyboard: Tab focuses each chart (Recharts accessibility layer, visible focus ring) and the arrow keys move the tooltip month by month.
  - Loading: three `role="status"` messages while data loads. Error: with the backend stopped, the English error message shows with `role="alert"` and KPIs show `—`.

## Internal skill refined after first run

Running `dashboard-pre-merge-qa` on this branch hit the Compose network issue above. Step 5 now documents the workaround, so the next run does not stop at "runtime not verified". `AGENTS.md` now points agents to `.skills/`.

## Still open

- Header label `2024 - Full Year` is hardcoded while backend dates come from `date.today()`.
- Lighthouse was not run in this session; contrast was checked by calculation from the CSS tokens.
