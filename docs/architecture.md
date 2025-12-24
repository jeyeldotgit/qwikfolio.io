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

**Authentication:**

- `useAuthSession` - Manages Supabase session state
- `useAuthForm` - Form state and validation for auth

**Dashboard:**

- `useDashboard` - Portfolio stats and status

**Portfolio:**

- `usePortfolioBuilder` - Portfolio editing and saving
- `usePortfolioPreview` - Portfolio preview data

**Profile:**

- `useProfile` - User profile data

**UI:**

- `useToast` - Toast notification system

### Pages (`src/pages`)

Route-level composition only:

- `LandingPage` - Homepage
- `AuthPage` - Authentication page
- `dashboard/index.tsx` - Dashboard
- `dashboard/builder.tsx` - Portfolio builder
- `dashboard/preview.tsx` - Portfolio preview
- `dashboard/profile-completion.tsx` - Profile setup
- `PublicPortfolioPage` - Public portfolio view

### Components (`src/components`)

**UI Components** (`src/components/ui/`):

- Button, Card, Dialog, Toast, Toaster, etc. (shadcn/ui style)

**Domain Components**:

- `builder/*` - Portfolio builder form sections
- `dashboard/*` - Dashboard-specific components
- `preview/*` - Portfolio preview components
- `route/*` - Routing components (ProtectedRoute)

### Services (`src/services`)

Pure business logic, no React dependencies:

**Portfolio:**

- `portfolio/portfolioService.ts` - Main barrel file (re-exports all functions)
- `portfolio/portfolio-errors.ts` - Error class definition
- `portfolio/portfolio-fetch.ts` - Fetch operations (getPortfolio, getPublicPortfolioByUsername)
- `portfolio/portfolio-fetch-helpers.ts` - Helper functions for fetching individual sections
- `portfolio/portfolio-assemble.ts` - Portfolio assembly and validation logic
- `portfolio/portfolio-mutations.ts` - Create/update/delete operations
- `portfolio/forms/portfolio-form-actions.ts` - Section-specific save operations

**Profile:**

- `profile/profileService.ts` - Profile management

**Authentication:**

- `auth/supabase-auth.ts` - Auth operations

**Analytics:**

- `analytics/analyticsService.ts` - Stats tracking

**Storage:**

- `storage/avatarStorageService.ts` - File uploads

---

## Folder Structure

src/
├─ schemas/ # Zod schemas and type definitions
├─ hooks/ # React hooks for state and behavior
├─ components/ # React components
│ ├─ ui/ # Reusable UI components
│ ├─ builder/ # Portfolio builder components
│ ├─ dashboard/ # Dashboard components
│ ├─ preview/ # Preview components
│ └─ route/ # Routing components
├─ pages/ # Route-level page components
├─ services/ # Business logic services
│ ├─ portfolio/ # Portfolio operations (modular structure)
│ │ ├─ forms/ # Section-specific save operations
│ │ └─ \*.ts # Fetch, mutations, assembly, errors
│ ├─ profile/ # Profile operations
│ ├─ auth/ # Authentication
│ ├─ analytics/ # Analytics tracking
│ └─ storage/ # File storage
└─ lib/ # Third-party integrations (Supabase, etc.)

---

## State Management Pattern

### State Machine Pattern

Hooks use a consistent state machine:

- `idle` - Initial state
- `loading` - Operation in progress
- `success` - Operation completed successfully
- `error` - Operation failed

### Hook Return Pattern

Hooks return objects, never tuples:

```typescript
// ✅ Good
const { data, isLoading, error } = useHook();

// ❌ Bad
const [data, isLoading] = useHook();
```

### Service Layer Pattern

- Services are pure functions
- No React dependencies
- Typed inputs and outputs
- Throw typed errors for error handling
- Hooks call services, services don't know about React
