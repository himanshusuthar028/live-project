# Farewell Fund: Project Information

## Project Name

Farewell Fund

## Purpose

Farewell Fund is a browser-based group-pool tracker. It helps an organiser set a budget, record what each person has paid, see fair shares and balances, and generate transfers for settling contributions.

## Problem Summary

A group is contributing equally to a shared gift or other pool, but people may pay different amounts, pay partially, pay extra, or pay nothing. The organiser needs a reliable view of the pool and a practical settlement plan.

## Main Features

- Editable fund name and pool target.
- Add multiple people with a name and initial payment.
- Edit participant names and payments inline.
- Show number of people, fair share, total collected, and remaining amount.
- Show whether each person owes money, is settled, or is ahead.
- Generate debtor-to-creditor settlement transfers.
- Distinguish an under-collected pool from redistribution of existing credits.
- Show an explicit shortfall message when the target is not fully collected.
- Reset the fund.
- Persist state in browser `localStorage`.
- Import messy CSV contribution lists with a cleaning report.
- Validate names, payments, budgets, and numeric values.

## How the Application Works

The browser loads `index.html`, which loads `settlement.js` followed by `app.js` using deferred script tags. `settlement.js` provides the calculation functions. `app.js` connects those functions to the DOM, manages user input, renders summaries and transfers, and saves state locally.

`importer.js` parses CSV contribution files, normalizes names and amounts, removes exact duplicate rows, combines contributions for the same normalized name, and returns rejected-row and merge details. `server.js` is a small Node.js static file server. It serves the application files and does not store application data on the server.

## Technology Stack

- HTML5
- CSS3
- Browser JavaScript
- Node.js built-in `http`, `fs`, and `path` modules
- Node.js built-in assertion module for tests
- Browser `localStorage`

There is no React, frontend framework, database, authentication system, external API, or backend application service.

## Project Structure

```text
.
├── app.js
├── index.html
├── package.json
├── README.md
├── server.js
├── settlement.js
├── settlement.test.js
├── styles.css
├── sample-contributions.csv
├── importer.js
├── importer.test.js
└── environment/
    ├── README.md
    ├── ai_logs.md
    └── reasoning.md
```

## Important Files

- `index.html`: Application markup, controls, summaries, people list, and settlement section.
- `styles.css`: Responsive layout and visual styling.
- `app.js`: Browser state, local persistence, event listeners, validation, rendering, and user interactions.
- `importer.js`: CSV parsing, name/amount normalization, duplicate handling, merging, and import reporting.
- `importer.test.js`: Import parser and cleaning tests.
- `sample-contributions.csv`: Messy sample input used for import testing and the download template.
- `settlement.js`: Currency conversion, INR formatting, fair-share calculation, balances, shortfall detection, and transfers.
- `settlement.test.js`: Node-based regression tests for normal cases, edge cases, and required examples.
- `server.js`: Static HTTP server. It uses `PORT` when provided and otherwise listens on port `3000`.
- `package.json`: Project metadata and `start`/`test` scripts.
- `README.md`: Short root-level setup instructions.

## Installation and Dependencies

Node.js 18 or newer is recommended. The project has no npm dependencies to install.

```bash
npm install
```

`npm install` is optional because `package.json` does not declare external dependencies.

## Run the Application

```bash
npm start
```

Open `http://localhost:3000` in a browser. If port 3000 is already in use, choose another port:

```bash
PORT=3001 npm start
```

## Run Tests

```bash
npm test
```

The tests execute `settlement.test.js` directly with Node.js.

## How to Use the Application

1. Enter a fund name and target amount.
2. Select **Add person**.
3. Enter a name and initial payment, then select **Add to group**.
4. Repeat for every participant.
5. Edit any payment directly in the people list as contributions change.
6. Read each person's balance and the settlement section.
7. Use **Reset** to clear the current fund after confirming the reset.

To import past payments, choose a CSV with `name,amount` columns, then select **Import**. Currency values such as `1000`, `1000.00`, `₹1000`, `₹1,000`, and `1,000.00` are accepted. Invalid rows are retained in the visible report with their row number and reason.

## Input and Output Behavior

Inputs are the fund name, non-negative target amount, participant name, and non-negative participant payment. The application immediately updates the displayed summaries and settlement list after valid changes.

Money is converted to integer cents for calculations and displayed as INR with two decimal places. Empty or invalid values are rejected or reported without allowing invalid values into the calculation state.

The output includes:

- Fair share per person.
- Total collected.
- Amount still needed to reach the target.
- Each person's paid amount and balance.
- Transfers from people who owe to people who paid extra.
- Import totals, rejected rows, removed exact duplicates, and normalized-name merges.

## Settlement Functionality

For each participant:

```text
balance = amount paid - fair share
```

Negative balances are debtors. Positive balances are creditors. The algorithm pairs debtors and creditors in order, transferring the smaller outstanding amount each time. It never creates a self-transfer, zero transfer, or negative transfer.

When the pool is fully collected, the transfers settle all balances. When the pool is under-collected, transfers only redistribute currently available credits; the UI separately reports the amount still needed and does not claim that everyone is fully settled.

## Validation and Edge Cases

Handled cases include:

- Zero people, without division by zero.
- One or many people.
- Zero payments.
- Exact payments.
- Partial payments.
- Extra payments.
- Decimal currency values.
- Under-collection.
- Exact collection.
- Over-collection.
- Empty participant names.
- Negative payments.
- Negative or invalid budgets.
- Invalid persisted localStorage data.
- Empty or malformed participant records.

Fair shares are represented in integer cents. When cents cannot divide evenly, the remainder cents are assigned to the first participants in list order.

### Import Rules

- Names are trimmed, repeated whitespace is collapsed, and comparison is case-insensitive. The first clean spelling is used for display.
- Contributions with the same normalized name are combined.
- A duplicate is removed only when a later row has the same trimmed, case-insensitive name field and the same trimmed amount field. This removes repeated identical imported rows while allowing separately formatted or otherwise different same-value payments to count as legitimate contributions.
- Amounts accept optional rupee symbols, grouping commas, and up to two decimal places. Empty, negative, malformed, and non-numeric amounts are rejected.
- Empty names, malformed rows, and invalid amounts are reported rather than silently discarded.
- Imported totals are added to an existing manually entered person when their normalized name matches; otherwise a new person is added.

## Environment Variables

No environment variables are required. `PORT` is optional and changes the local HTTP server port.

## Limitations

- Data is stored only in the current browser's localStorage and is not shared between browsers or users.
- There is no account, server database, synchronisation, export, or multi-user collaboration.
- The static server is intended for local/Codespaces use, not production hosting.
- Transfer pairing is a straightforward greedy algorithm. It reduces transfers by consuming each debtor/creditor balance in sequence but is not a global optimisation over every possible pairing.
