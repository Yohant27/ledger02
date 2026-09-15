# Uni Finance

Phase 1–6 of the spec: quick entry, RM25/day target bar with RM20 warning marker, per-day included/excluded calendar, and live "saved so far" tracking. Same navy/paper Ledger design system. Data is local-only (IndexedDB via Dexie) — nothing leaves your device.

Deliberately NOT included yet (later phases, once you've used this for a couple weeks): transaction history/editing beyond today, analytics, budgets, planned expenses, savings goals, settings screen, backup/export.

## What's in here
- `src/logic.js` — all the financial math, kept separate from the UI on purpose so it's easy to verify and trust
- `src/db.js` — the local database (Dexie/IndexedDB)
- `src/App.jsx` — ties Home and the day-calendar together
- `src/components/` — the individual pieces (entry form, daily bar, saved-so-far card, calendar, today's list)

## Deploy it (same steps as Ledger)

1. **GitHub:** create a new **private** repo (e.g. `uni-finance`), upload the *contents* of this folder directly into the repo root — not the folder itself nested inside (that's what caused the Ledger deploy issue).
2. **Vercel:** Add New Project → import the repo. If the Framework Preset doesn't auto-detect, manually select **Vite**. Deploy.
3. **Install on your phone:** open the Vercel URL → Share/menu → "Add to Home Screen" / "Install app".

## Making changes later
Same workflow as Ledger: edit a file on GitHub → choose "Create a new branch and start a pull request" → test the Vercel preview link → merge when it looks right.

## A note on the "saved so far" number
This is the part of the app that actually needs to be trustworthy, since it's telling you something about your real finances. It's been tested against the exact example from the spec (11 eligible days × RM25 − RM220 spent = RM55 saved) plus edge cases: future dates never count, excluded-day spending still shows in your total but never touches the saved figure, and manual day overrides work correctly. If a number ever looks wrong once you're using it for real, flag it — don't just assume it's right.
