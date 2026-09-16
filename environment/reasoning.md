# Engineering Reasoning

This document records high-level engineering decisions, not private chain-of-thought or hidden model reasoning.

## Requirement Interpretation

The core requirement is a simple organiser-facing tracker for an arbitrary shared pool. The implementation therefore prioritises immediate feedback, clear balances, predictable settlement output, input validation, and low operational complexity over accounts, collaboration, or a database.

## Architecture Decision

A static HTML/CSS/JavaScript application with a small Node.js file server is appropriate because the problem does not require authentication, server persistence, an API, or multi-user access. Keeping calculations in `settlement.js` makes the most important behavior independently testable. `app.js` is responsible for browser state and presentation.

The import path is isolated in `importer.js`. This keeps messy-file parsing and cleaning separate from the existing pool calculation engine, while cleaned people are passed into the same `app.js` state used by manual entry.

## Money Representation

All monetary calculations use integer cents. An input amount is converted with:

```text
toCents(amount) = round(amount * 100)
```

This avoids common floating-point comparison errors. Display formatting converts cents back to INR with two decimal places.

## Fair Share

For a target `T` and `N` people:

```text
fairShare = T / N
```

The implementation divides integer target cents. Each person receives the floor share, and the remaining cents are assigned one at a time to the first people in list order. If there are zero people, the share is zero and no division occurs.

For example, ₹10 across three people becomes 334, 333, and 333 cents.

## Individual Balances

For each person:

```text
balance = paidAmount - fairShare
```

- A negative balance means the person owes money.
- A zero balance means the person is settled.
- A positive balance means the person has paid extra and should receive money from the group.

## Collection Totals

```text
totalCollected = sum(all paid amounts)
shortfall = max(0, target - totalCollected)
```

The UI calls the shortfall both the remaining amount and the amount still to collect. Over-collection does not produce a negative remaining amount; instead, the UI indicates how much was collected over the target.

## Settlement Algorithm

The calculation creates two ordered lists:

- Debtors: people whose balance is negative, with the owed amount made positive.
- Creditors: people whose balance is positive, with the credit amount.

It repeatedly matches the current debtor with the current creditor and transfers the smaller amount:

```text
transfer = min(debtor amount, creditor amount)
```

The completed side is removed from consideration and the other side continues. This creates valid debtor-to-creditor transfers without self-payments, zero values, or negative values. It is a greedy pairing strategy that keeps the output compact, although it does not search every possible global pairing.

## Under-Collection and Over-Collection

When the target is under-collected, the balances calculated against the full fair share necessarily sum to a negative amount. Existing creditors can still receive transfers from debtors, so the app keeps those valid redistribution transfers. However, those transfers cannot create missing money. The plan exposes `shortfallCents` and `isFullyCollected`, while the UI displays a message such as:

> ₹2000 still needs to be collected before everyone can be fully settled.

The settlement caption explicitly says that the listed transfers only redistribute existing credits. If no credits exist, the UI does not show a false “Everyone is settled” state.

When collection equals or exceeds the target, the total balances can be settled through the generated transfers. Over-collection is represented by positive balances and handled as credits.

## Partial, Zero, and Extra Payments

The calculation does not require a minimum payment. A zero payment creates a normal debtor balance. A partial payment creates a smaller debtor balance. An extra payment creates a creditor balance. The same settlement process handles all three cases.

## Validation Decisions

- Targets and payments must be finite and non-negative.
- Participant names must not be empty when adding or editing.
- Invalid persisted state is normalised rather than allowed to crash rendering.
- Invalid input is reported in the UI and is not committed to the calculation state.
- Zero people produce a zero fair share and an appropriate pool shortfall.

## Import Cleaning Decisions

The importer expects `name,amount` CSV columns and uses a small CSV state machine so quoted commas are supported. It also joins unquoted extra amount fields, allowing common input such as `Priya,₹1,000` to be interpreted as one amount.

Names are normalized by trimming, collapsing whitespace, and case-folding for comparison. The first clean display spelling is preserved. This safely merges capitalization and spacing variants without fuzzy matching that could merge unrelated people.

Amounts remove an optional `₹` prefix and grouping commas, then require a non-negative number with at most two decimal places. Invalid names and amounts become structured rejected-row entries.

The duplicate rule is deliberately conservative: a later row is considered an exact duplicate when its trimmed, case-insensitive name field and trimmed amount field match an earlier row. Different formatting, such as `₹500` versus `500.00`, is not silently removed, so it can represent a separate legitimate payment. After duplicate filtering, all remaining contributions for a normalized name are summed.

The UI displays rows read, valid rows imported, exact duplicates removed, names merged, and rejected rows. It also lists merge pairs and rejected row numbers/reasons. Imported totals are added to matching existing manual people and then go through the normal fair-share, balance, and settlement render path.

## Persistence Decision

`localStorage` is sufficient for a single organiser using one browser. It keeps the project simple and requires no server database. If storage is unavailable, the app continues for the current session and displays that persistence is unavailable.

## Testing Strategy

The Node test suite checks:

- Zero and one-person cases.
- Zero, exact, partial, extra, and decimal payments.
- Under-collection and over-collection.
- Invalid negative values.
- Fair-share rounding.
- The original ₹6000 six-person example.
- The ₹8000 under-collected example.
- CSV currency parsing and quoted/unquoted comma handling.
- Duplicate-row removal and differently formatted same-value payments.
- Case/whitespace name merging.
- Invalid-row reporting for missing names and malformed/negative amounts.
- No self, zero, or negative transfers.

Additional browser-like DOM checks exercised adding six people, changing the target, editing a payment, checking settlement counts, and observing the under-collection message without runtime errors.

## Trade-offs and Limitations

The app intentionally does not include accounts, a database, server-side APIs, collaboration, or synchronisation. The greedy transfer algorithm is understandable and reliable for this scope, but it is not a mathematically exhaustive minimum-transfer solver for every possible balance set. Browser localStorage is local to one browser profile and can be cleared by the user.
