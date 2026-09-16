# AI Usage Log

This log records the AI-assisted work visible in the current project session. It is a factual summary, not a full private reasoning transcript.

## Project Phases

### 2026-09-16: Initial implementation

- **AI tool used:** GitHub Copilot coding agent in VS Code, using workspace file inspection, patch editing, terminal commands, and Node tests.
- **User/task request:** Build a general Farewell Fund/group-pool tracker from an initially empty repository.
- **Instruction/prompt used:** Implement the supplied group-pool problem, inspect the repository, create a runnable solution, test it, and document how to run it.
- **Implemented or changed:** Created the dependency-free HTML/CSS/JavaScript application, Node static server, settlement engine, package scripts, tests, and root README instructions.
- **Testing/debugging:** Ran `npm test`, JavaScript syntax checks, HTTP asset checks, and whitespace validation.
- **Bugs discovered:** An initial settlement test fixture expected an incorrect transfer amount.
- **Fixes made:** Corrected the test fixture after comparing it with calculated balances.

### 2026-09-16: Add-person interaction fix

- **AI tool used:** GitHub Copilot coding agent with file reads, patch edits, terminal checks, and a temporary DOM test harness.
- **User/task request:** Fix the non-responsive Add person control and verify adding multiple people, payment edits, target changes, balances, and settlements.
- **Instruction/prompt used:** Inspect `index.html`, `app.js`, and `styles.css`; identify runtime or event-listener failures; implement and test the fix without creating a new project.
- **Implemented or changed:** Added the inline Add person form, validation, cancel behavior, multiple-person support, persistence handling, and expanded regression tests.
- **Testing/debugging:** Ran syntax checks, `npm test`, live HTTP checks, and a browser-like DOM flow.
- **Bugs discovered:** The app initially used hard-coded demo records and needed stronger invalid-state handling. A later DOM run exposed a JavaScript global-name collision.
- **Fixes made:** Removed demo data, normalised persisted state, added input validation, and renamed app-local calculation references to avoid the collision.

### 2026-09-16: JavaScript interaction root-cause fix

- **AI tool used:** GitHub Copilot coding agent with static inspection, server checks, jsdom execution, and patch editing.
- **User/task request:** Diagnose why the whole frontend appeared non-interactive and verify the actual Add person flow.
- **Instruction/prompt used:** Verify script tags and paths, check syntax and serving, inspect runtime errors and event listeners, then test the real interaction.
- **Implemented or changed:** Added deferred script loading and DOM-safe initialization. Renamed the destructured `calculatePlan`/`formatMoney` variables in `app.js` to avoid a browser `SyntaxError` caused by `settlement.js`'s top-level declarations.
- **Testing/debugging:** The jsdom harness captured `Identifier 'calculatePlan' has already been declared`, then passed after the fix. It exercised six additions, target changes, payment edits, settlement updates, and reported no browser-like runtime errors.
- **Bugs discovered:** The name collision prevented `app.js` from parsing, so no event listeners were registered.
- **Fixes made:** Renamed the conflicting identifiers and verified the served app.

### 2026-09-16: Under-collected settlement clarification

- **AI tool used:** GitHub Copilot coding agent with settlement inspection, patch editing, Node tests, and jsdom checks.
- **User/task request:** Distinguish the amount still needed to complete an under-collected pool from transfers that redistribute available credits.
- **Instruction/prompt used:** Verify the ₹6000 and ₹8000 scenarios, avoid false fully-settled messaging, and retain only valid transfers.
- **Implemented or changed:** Added `shortfallCents` and `isFullyCollected`; added an under-collection alert and a redistribution-specific settlement caption; changed the empty settlement state so it cannot claim full settlement while money is missing.
- **Testing/debugging:** Added exact regression assertions for the ₹8000 scenario, confirmed the original ₹6000 scenario, ran `npm test`, syntax checks, and a jsdom UI render check.
- **Bugs discovered:** The prior display could imply complete settlement whenever the transfer list was empty, even if the pool target was not collected.
- **Fixes made:** Added explicit shortfall status and under-collection messaging.

## Final Verification Recorded

- `npm test` passed after the documented changes.
- `node --check app.js` and `node --check settlement.js` passed.
- Static server asset checks returned the expected application files.
- Browser-like DOM checks observed the Add person flow and settlement updates without captured runtime errors.
- The ₹6000 fully collected case and ₹8000 under-collected case were both verified.

## FULL CHAT TRANSCRIPT TO BE ADDED

The complete ChatGPT/Copilot conversation transcript is not stored in this repository. It must be pasted here later if a full transcript is required.

### Transcript Placeholder

```text
[Paste the complete conversation transcript here when it is available.
Do not reconstruct or infer missing messages.]
```
