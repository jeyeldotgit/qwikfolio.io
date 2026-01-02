# System Architecture

> **Study Goal**: Understand how a production React application is structured to maximize maintainability, testability, and scalability.

## Table of Contents

1. [Architectural Principles](#architectural-principles)
2. [The Golden Rule: Data Flow](#the-golden-rule-data-flow)
3. [Layer Overview](#layer-overview)
4. [Folder Structure](#folder-structure)
5. [Module Dependency Graph](#module-dependency-graph)

---

## Architectural Principles

### 1. Separation of Concerns

Every piece of code should have **one job** and do it well.

```
┌─────────────────────────────────────────────────────────────┐
│  PAGES         │ Route-level composition only               │
│                │ → Assembles hooks + components              │
│                │ → NO business logic                         │
├─────────────────────────────────────────────────────────────┤
│  HOOKS         │ Behavior and state management              │
│                │ → Owns all stateful logic                   │
│                │ → Calls services                            │
│                │ → Returns clean APIs to pages               │
├─────────────────────────────────────────────────────────────┤
│  COMPONENTS    │ Presentational only                        │
│                │ → Receives props, renders UI                │
│                │ → NO data fetching                          │
│                │ → NO side effects (mostly)                  │
├─────────────────────────────────────────────────────────────┤
│  SERVICES      │ Pure business logic                        │
│                │ → NO React dependencies                     │
│                │ → Handles API calls, data transformation    │
│                │ → Can be unit tested in isolation           │
├─────────────────────────────────────────────────────────────┤
│  SCHEMAS       │ Single source of truth                     │
│                │ → Defines data shapes (Zod)                 │
│                │ → TypeScript types inferred                 │
│                │ → Validation rules co-located               │
└─────────────────────────────────────────────────────────────┘
```

### 2. Schema-Driven Design

**Why?** When your types and validation live in one place, changes propagate automatically.

```typescript
// schemas/auth.ts
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Type is INFERRED, not manually written
export type SignInFormValues = z.infer<typeof signInSchema>;
```

**Benefits:**

- Change schema → Types update everywhere
- Validation rules are documentation
- No type/validation drift

### 3. Hooks for Behavior

**Rule**: Hooks encapsulate behavior. They never render JSX.

```typescript
// ✅ Good: Hook returns data and handlers
const useAuthForm = (mode) => ({
  values,
  errors,
  handleChange,
  handleSubmit,
});

// ❌ Bad: Hook returns JSX
const useAuthForm = () => {
  return <form>...</form>; // Never do this
};
```

### 4. Type Safety as a Boundary

**Rule**: Types protect the boundaries between layers.

```typescript
// ❌ Bad: Using 'any' breaks type safety
const fetchData = (id: any) => { ... }

// ✅ Good: Explicit types catch errors at compile time
const fetchData = (id: string): Promise<Portfolio | null> => { ... }
```

---

## The Golden Rule: Data Flow

```
User Action → Page → Hook → Service → Database
                ↓
            Component ← Hook (returns data)
```

**Unidirectional data flow** means:

- Data flows DOWN (parent → child via props)
- Events flow UP (child → parent via callbacks)
- Side effects happen in hooks, not components

---

## Layer Overview

### Schemas (`src/schemas/`)

Define data shape and validation. This is where truth lives.

| File           | Purpose                         |
| -------------- | ------------------------------- |
| `auth.ts`      | Sign-in/sign-up form validation |
| `portfolio.ts` | Portfolio data structure        |
| `profile.ts`   | User profile structure          |

### Hooks (`src/hooks/`)

Encapsulate all stateful behavior:

| Hook                  | Responsibility                         |
| --------------------- | -------------------------------------- |
| `useAuthSession`      | Global auth state (Context + Provider) |
| `useAuthForm`         | Form state and validation              |
| `useDashboard`        | Portfolio stats and status             |
| `usePortfolioBuilder` | Portfolio editing                      |
| `usePortfolioPreview` | Portfolio preview data                 |
| `useProfile`          | User profile data                      |
| `useToast`            | Toast notification system              |
| `useTheme`            | Light/dark theme management            |

### Pages (`src/pages/`)

Route-level composition **only**:

| Page                  | Route                | Description       |
| --------------------- | -------------------- | ----------------- |
| `LandingPage`         | `/`                  | Public homepage   |
| `AuthPage`            | `/auth`              | Authentication    |
| `dashboard/index`     | `/dashboard`         | User dashboard    |
| `dashboard/builder`   | `/dashboard/builder` | Portfolio editor  |
| `dashboard/preview`   | `/dashboard/preview` | Portfolio preview |
| `PublicPortfolioPage` | `/:username`         | Public portfolio  |

### Components (`src/components/`)

**UI Components** (`ui/`): Reusable, style-focused

- Button, Card, Dialog, Toast, Avatar, Input, etc.

**Domain Components**: Feature-specific

- `builder/*` - Form sections
- `dashboard/*` - Dashboard widgets
- `preview/*` - Portfolio templates
- `route/*` - Routing utilities

### Services (`src/services/`)

Pure business logic, **zero React dependencies**:

```
services/
├── auth/
│   └── supabase-auth.ts      # Auth operations
├── portfolio/
│   ├── portfolioService.ts   # Main barrel file
│   ├── portfolio-fetch.ts    # Read operations
│   ├── portfolio-mutations.ts # Write operations
│   ├── portfolio-assemble.ts  # Data assembly
│   └── portfolio-errors.ts    # Error types
├── profile/
│   └── profileService.ts     # Profile CRUD
├── analytics/
│   └── analyticsService.ts   # Stats tracking
└── storage/
    └── avatarStorageService.ts # File uploads
```

---

## Folder Structure

```
src/
├── schemas/          # 📋 Zod schemas + types
├── hooks/            # 🧠 State and behavior
├── components/       # 🎨 UI components
│   ├── ui/          #    Atoms (Button, Input)
│   ├── builder/     #    Portfolio builder forms
│   ├── dashboard/   #    Dashboard widgets
│   ├── preview/     #    Portfolio templates
│   └── route/       #    ProtectedRoute, etc.
├── pages/            # 📄 Route compositions
│   └── dashboard/   #    Dashboard sub-routes
├── services/         # ⚙️ Business logic
│   ├── auth/
│   ├── portfolio/
│   ├── profile/
│   ├── analytics/
│   └── storage/
└── lib/              # 🔌 Third-party integrations
    ├── supabase.ts  #    Database client
    └── utils.ts     #    Utility functions
```

---

## Module Dependency Graph

```
                    ┌──────────────┐
                    │   SCHEMAS    │  ← Source of truth
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ SERVICES │ │   LIB    │ │  TYPES   │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │            │            │
             └────────────┼────────────┘
                          ▼
                    ┌──────────┐
                    │  HOOKS   │  ← Orchestration layer
                    └────┬─────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        ┌──────────┐         ┌──────────────┐
        │  PAGES   │         │  COMPONENTS  │
        └──────────┘         └──────────────┘
```

**Key insight**: Dependencies flow **downward**. Lower layers never import from higher layers.

---

## Related Documentation

- [State Management Strategy](./state-management.md)
- [Component Design System](./component-design.md)
- [Data Flow & Services](./data-flow-services.md)
- [Hooks & Utilities](./hooks-utilities.md)
- [Environment & Infrastructure](./environment-infrastructure.md)
