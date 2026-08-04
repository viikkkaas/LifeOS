# Sales Tracking in LifeOS — Design

**Date:** 2026-08-04
**Status:** Approved for implementation

## Goal

Add a complete sales pipeline tracking layer to LifeOS so the user can record daily call activity, run a weekly (Sunday) review, track signed clients, check monthly progress against targets, and keep versioned playbook documentation (script, objections, demo flow, n8n summary, bug log).

## Decisions (from brainstorm)

- Navigation: new **Sales** sidebar group with sub-pages.
- Daily entry: aggregate counter-style form (fast entry), extending the existing Daily Goals page.
- Weekly review: auto-computed stats from daily entries + manual Sunday form, saved per-week with history.
- Clients: simple editable client cards.
- Monthly: live progress vs targets computed from client close dates + per-month entry form.
- Playbook: in-app editable documentation sections, persisted in localStorage.
- Daily route moves from `/daily-goals` to `/sales/daily` (clean `/sales/*` structure). Old route removed; sidebar + dashboard links updated.
- Dashboard: upgrade "Today's Cold Calls" card + add a compact Sales Snapshot card.

## Data Model

### `DailyGoal` (extended, backward-compatible)

Existing fields retained: `id`, `date`, `coldCalls`, `conversations`, `demos`, `gatekeepersPassed`, `shows`, `notes`, `createdAt`.

Added:
- `objections: { price, timing, trust, alreadyHas, other }` (counts)
- `closes: number`
- `noCloses: number`
- `noCloseReasons: { price, timing, trust, wantsToThink, ghosted, other }` (tally)
- `scriptVersion: string`

Derived: no-shows = `demos - shows` (displayed, not stored).

### `WeeklyReview`

- `id`, `weekStart` (ISO date of Monday), `createdAt`
- `scriptChanges: string` (changes made + why)
- `leadsRemaining: number`
- `bugsFixed: string`
- `bugsOpen: string`
- `hoursSales: number`, `hoursTech: number`, `hoursCollege: number`
- `notes: string`

### `Client`

- `id`, `name`, `clinic`, `closeDate` (ISO), `setupFee: number`, `mrr: number`
- `onboardingStatus: "Pending" | "Delivered" | "Overdue"`
- `caseStudyRights: boolean`
- `issues: string` (post-launch issues/tickets)
- `createdAt`

### `MonthlyCheckpoint`

- `id`, `month` (e.g. "2026-08"), `createdAt`
- `mrrTotal: number` (prefilled from client MRRs, editable)
- `churn: number`
- `collegeStatus: "Passing" | "At Risk" | "Clear"`
- `notes: string`

### `Playbook`

- `scriptVersions: { version: string; content: string }[]`
- `objectionsDoc: string`
- `demoFlow: string`
- `n8nSummary: string`
- `bugs: { id: string; title: string; status: "Open" | "Fixed"; date: string; detail: string }[]`

### Targets

Hardcoded milestone targets used by the Monthly page:
- 1 client by Aug 2026
- 3 clients by Oct 2026
- 5+ clients by Dec 2026

## Store

New actions in `store/AppContext.tsx`:
- `ADD_WEEKLY_REVIEW`, `UPDATE_WEEKLY_REVIEW`, `DELETE_WEEKLY_REVIEW`
- `ADD_CLIENT`, `UPDATE_CLIENT`, `DELETE_CLIENT`
- `ADD_MONTHLY_CHECKPOINT`, `UPDATE_MONTHLY_CHECKPOINT`, `DELETE_MONTHLY_CHECKPOINT`
- `SAVE_SCRIPT_VERSION` / `DELETE_SCRIPT_VERSION`
- `UPDATE_PLAYBOOK` (partial for objectionsDoc/demoFlow/n8nSummary)
- `ADD_BUG`, `UPDATE_BUG`, `DELETE_BUG`

The existing `INIT` merge (`{...DEFAULT_APP_DATA, ...payload}`) automatically supplies the new arrays for old localStorage data.

## Pages

All follow the existing pattern: client component, `<Sidebar />`, `<main className="lg:pl-64">`, `card`/`input-premium`/`select-premium` classes, framer-motion entrance.

1. **`/sales/daily`** — moved + upgraded Daily Goals page. Objection tallies per type, closes, no-close reason chips, script version input, no-show metric. Weekly summary gains conversion rates.
2. **`/sales/weekly`** — current-week funnel computed read-only (call→gatekeeper→demo→close %, best script version by close rate) + Sunday form for manual fields. History of past weeks.
3. **`/sales/clients`** — client card grid with add/edit/delete.
4. **`/sales/monthly`** — live progress vs targets + monthly entry form + history.
5. **`/sales/playbook`** — editable docs with versioned scripts and bug log.

## Navigation

`Sidebar.tsx`: add Sales group (icon `Phone`) with Daily Log, Weekly Review, Clients, Monthly Checkpoints, Playbook. Remove "Daily Goals" from Life group.

## Dashboard

`components/dashboard/DashboardView.tsx`:
- Upgrade "Today's Cold Calls" → "Sales Today": add closes, no-shows, script version; link to `/sales/daily`.
- Add "Sales Snapshot" card: this week's calls/demos, clients vs next target, total client MRR.

## Files Touched

- `types/index.ts`
- `lib/defaults.ts`
- `store/AppContext.tsx`
- `components/layout/Sidebar.tsx`
- `components/dashboard/DashboardView.tsx`
- `app/sales/{daily,weekly,clients,monthly,playbook}/page.tsx` (new)
- `app/daily-goals/` (deleted, moved to `/sales/daily`)

## Verification

`npm run build` passes; dev server sanity check.