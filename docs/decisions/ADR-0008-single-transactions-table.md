# ADR-0008 — One transactions table for income and expense

**Status:** Proposed (2026-11-06)

## Context
FR-002 and FR-003 share most fields. Two things differ by type:
- Income has no payment method (FR-003.1).
- The category's type must match the transaction's type.

Savings calculations, search and filtering by type all need income and expenses together.

## Decision
Use one `transactions` table with a `type` discriminator.
- A table CHECK enforces that expenses have a payment method and income does not.
- A composite foreign key `(category_id, type) → categories(id, type)` enforces matching category types.
- Amounts are always positive (FR-003A.1).

## Alternatives
- **Separate `income` and `expenses` tables:** duplicates repositories and forms, needs UNION queries for history and savings, and changes a record's identity when the user edits its type.

## Consequences
- \+ One repository, one form, and totals computed in a single query with one covering index.
- − Type-specific rules live in CHECK constraints rather than in separate schemas. Database tests cover them.
