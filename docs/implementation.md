# Implementation Details

## Authentication (UI-Only)

- Zod-based auth schema (email + password)
- `useAuthForm` manages state, validation, submission
- `AuthForm` is presentational
- Social auth buttons are console-only stubs

---

## Dashboard

### Behavior

- Decision-based rendering:
  - Empty state if no portfolio
  - Stats dashboard if portfolio exists

### Stats (Mocked)

- Total views
- Resume downloads
- Publish status

### Hook

- `useDashboard` owns all dashboard state

---

## Portfolio Builder

- Fully schema-driven
- Initialized from `mockdata.json`
- Managed by `usePortfolioBuilder`
- Save action validates and logs output

### Sections

- Personal Info
- Skills
- Projects
- Experience
- Education

---

## Preview

- Resume-style layout
- Printable / PDF-friendly
- Publish/unpublish via local state
