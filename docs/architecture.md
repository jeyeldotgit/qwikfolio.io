# System Architecture

## Architectural Principles

- **Separation of Concerns**

  - Pages compose UI and hooks
  - Hooks own behavior and state
  - Components are presentational only

- **Schema-Driven Design**

  - Zod schemas define structure and validation
  - TypeScript types inferred from schemas

- **Hooks for Behavior**

  - Hooks never render JSX
  - Hooks expose explicit APIs

- **Type Safety as a Boundary**
  - No `any`
  - Typed props and hook returns

---

## High-Level Architecture

Schemas → Hooks → Pages → Components

### Schemas (`src/schemas`)

Define data shape and validation rules.

### Hooks (`src/hooks`)

Encapsulate all behavior and state:

- `useAuthForm`
- `useDashboard`
- `usePortfolioBuilder`
- `usePortfolioPreview`

### Pages (`src/pages`)

Route-level composition only.

### Components (`src/components`)

Reusable UI and domain components.

---

## Folder Structure

src/
├─ schemas/
├─ hooks/
├─ components/
├─ pages/
├─ services/
└─ lib/
