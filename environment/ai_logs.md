# AI-Assisted Development Log

This is a high-level factual record of AI-assisted development work visible in the current coding workspace. It does not include private chain-of-thought, hidden reasoning, or an invented transcript.

## Phase 1 - Initial Problem Analysis

AI assistance was used to interpret the Farewell Fund Tracker requirements and identify the core workflow:

- Configure a fund name and pool target.
- Add people and record payments.
- Calculate equal fair shares.
- Show individual balances, collected amount, and remaining amount.
- Generate settlement transfers between people who owe and people who paid extra.

## Phase 2 - Initial Implementation

The project was implemented as a small vanilla browser application with a Node.js static server.

Implemented areas included:

- HTML interface in `index.html`.
- CSS layout and responsive styling in `styles.css`.
- Browser state, event handling, validation, localStorage persistence, and rendering in `app.js`.
- Currency conversion, fair-share calculation, balances, shortfall handling, and settlement logic in `settlement.js`.
- Static file serving in `server.js`.
- Node.js regression tests in `settlement.test.js`.
- `npm start` and `npm test` scripts in `package.json`.

No React, database, authentication, external API, or other unverified technology was introduced.

## Phase 3 - UI Debugging

The initial UI had a non-working **Add person** interaction. AI assistance inspected the HTML script tags, script ordering, DOM selectors, event listeners, and runtime behavior. The interaction was corrected, and the Add person form was tested successfully with multiple people and payment values.

A browser-like runtime check later verified that the interaction failure came from a JavaScript name collision between top-level settlement declarations and app declarations. The app-local references were renamed, script loading was made deferred, and DOM-safe initialization was retained.

## Phase 4 - Functional Testing

The application was tested with a ₹6000 target and six people. Verification covered:

- Six participants.
- ₹1000 fair share per person.
- ₹6000 collected.
- Individual debtor and creditor balances.
- Valid settlement transfers.
- Payment editing and automatic recalculation.

## Phase 5 - Under-Collected Pool Handling

The application was tested with a ₹8000 target and ₹6000 collected. It was updated to distinguish available-credit redistribution from the missing pool amount.

The UI now clearly reports that ₹2000 still needs to be collected before everyone can be fully settled. It does not claim full settlement while the pool is under-collected.

## Phase 6 - The Twist: Messy Contribution Import

A CSV import requirement was added for historical contribution data containing:

- Duplicate entries.
- Different name capitalization and whitespace formatting.
- Currency symbols, grouping commas, and decimal amounts.
- Empty names and invalid amounts.

Implemented import work included:

- CSV file upload in the existing UI.
- A downloadable sample CSV.
- CSV parsing with quoted-field support.
- Name normalization and merging.
- Amount normalization and non-negative validation.
- Conservative exact duplicate handling.
- Invalid-row reporting with row number and reason.
- Merge reporting.
- Import summary counters.
- Recalculation of people, payments, balances, fair shares, shortfall, and settlement transfers.

## Phase 7 - Import Testing

The provided sample CSV was tested through the browser-like import flow. It included valid contributions, Rahul/rahul/RAHUL capitalization variants, multiple currency formats, `Rohit,abc`, and a missing-name row.

Observed sample result:

- Rows read: 10.
- Imported: 8.
- Duplicates removed: 0, because the sample did not contain an exact duplicate row.
- Names merged: 3.
- Rejected: 2.

Additional test data verified one exact duplicate removal and separately formatted same-value contributions remaining legitimate. Malformed unterminated CSV was also tested and reported without crashing the application.

## Phase 8 - Documentation

AI assistance was used to update the documentation in `environment/`:

- `environment/README.md` documents the final project, setup, workflow, calculations, import rules, validation, tests, and limitations.
- `environment/reasoning.md` documents high-level engineering decisions and formulas.
- `environment/ai_logs.md` records this chronological high-level activity.

## Phase 9 - Final Verification

The final verification covered:

- Application startup with `npm start`.
- Manual Add person and multiple-person entry.
- Payment editing and automatic dashboard updates.
- Fund name and target editing.
- Reset and validation behavior.
- ₹6000 fully collected settlement case.
- ₹8000 under-collected settlement case.
- CSV import and sample download asset.
- Name normalization and merging.
- Currency amount normalization.
- Exact duplicate handling.
- Invalid-row reporting.
- Malformed CSV handling.
- Imported data flowing into balances and settlements.
- Manual entry after import.
- `npm test` passing for settlement and importer suites.
- JavaScript syntax and static-server asset checks.
- No secret-like files found in the repository.

## Transcript Availability

Full chat transcript is not automatically available inside the coding workspace. This document records the verified high-level AI-assisted development activities rather than fabricating a transcript.
