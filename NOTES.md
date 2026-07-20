# Project notes

Internal working notes for LaunchLens. Not user-facing — see README.md for the public-facing description.

## Current state

- Single-page app in `launchlens_v2/`, everything client-side except the Gemini proxy in `server.js`.
- `src/App.jsx` is ~2,100 lines and contains the entire application: theme tokens, the login/signup screen, dashboard, and every idea-workspace view (market research, customer discovery, tasks, checklist, mentor chat, notes, progress, analytics, settings). No file splitting yet.
- No router — navigation is state-driven (whatever view/idea is "selected" lives in `useState` in `App.jsx`).
- No persistence layer at all: ideas, tasks, checklist state, interview notes, and chat history live only in React state. A page refresh wipes everything. There is no localStorage, no backend database, nothing.
- Auth screen (email/password + "Continue with Google") is decorative only — it doesn't call any auth provider or check credentials. Anyone can "sign in" with anything.
- The only real network call is the AI proxy: frontend → `POST /api/claude` (Express, `server.js`) → Gemini `generateContent` REST endpoint. Vite's dev server proxies `/api/*` to `http://localhost:3001` (see `vite.config.js`), so in dev both processes need to be running (`npm run dev` starts both via `concurrently`).

## Known issues / gotchas

- **Stale naming from a provider switch**: the route is `/api/claude`, the frontend helper is `askClaude()`, and there's a top-of-file comment in `App.jsx` claiming "AI features call the Anthropic API directly via fetch to /v1/messages." None of that is true anymore — the app was migrated to call Google Gemini (`gemini-2.5-flash`) through the Express proxy, and the old names/comments were never updated. Anyone touching the AI integration should ignore that comment and read the actual implementation in `server.js` instead. Worth a rename pass (`askClaude` → `askAI` or similar, route → `/api/ai` or `/api/gemini`) plus deleting the stale header comment, but low urgency since it's cosmetic.
- The nested `launchlens_v2/README.md` is out of date — it tells readers to `cp .env.example .env`, but no `.env.example` file exists in the repo. The root `README.md` (the one being maintained now) has the correct instructions (create `.env` manually with `GEMINI_API_KEY` and optional `PORT`). Consider either deleting `launchlens_v2/README.md` or making it a pointer to the root README so there's a single source of truth. Left as-is for now since it wasn't in scope for this pass.
- No `.env.example` — first-time setup requires copying the two variable names from the README by hand. Adding a checked-in `.env.example` (with `GEMINI_API_KEY=` and `PORT=3001` placeholders) would be a small, safe improvement.
- No automated tests exist anywhere in the repo (no test runner in `package.json`, no `__tests__`/`*.test.*` files). All verification has been manual.
- `.env` is gitignored (confirmed in `launchlens_v2/.gitignore`), and a prior commit ("Stop tracking .env and ignore node_modules") suggests `.env` may have been committed to history at some point — worth a quick `git log --all --full-history -- launchlens_v2/.env` check and a key rotation if the old key is still live, since git history isn't automatically scrubbed by adding a later `.gitignore` entry.

## Architecture decisions worth remembering

- Single-file `App.jsx` was presumably a deliberate simplicity tradeoff for a demo/prototype app — no build complexity from routing or state-management libraries. It will get harder to maintain if the feature set keeps growing; splitting into per-view components (Dashboard.jsx, TasksBoard.jsx, MentorChat.jsx, etc.) would be the natural next refactor once this stabilizes.
- Keeping all app data in memory (no backend datastore) is consistent with this being a workspace/demo tool rather than a product with real accounts — but it also means nothing survives a refresh, which is the single biggest UX limitation right now.
- The Express proxy exists solely to keep `GEMINI_API_KEY` off the client; it does no other business logic (no auth, no rate limiting, no logging beyond console.error).

## Ideas for next steps

- Add real persistence (start with localStorage for zero-infra durability, or a small backend + database if multi-device/multi-user support is wanted).
- Wire up real auth if this moves past demo stage (the current login screen is pure UI).
- Add `.env.example` and reconcile the two README files.
- Rename the `/api/claude` / `askClaude` leftovers to match the actual Gemini integration.
- Consider basic tests around the Gemini response parsing in `server.js` (the `parts.map(p => p.text).join("\n")` logic is a likely spot for silent breakage if Gemini's response shape changes).
