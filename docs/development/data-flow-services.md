# Data Flow & Services

> **Study Goal**: Understand how data moves through a React application, from API to UI, and how to structure a service layer for clean, testable code.

## Table of Contents

1. [The Service Layer Pattern](#the-service-layer-pattern)
2. [Data Flow Architecture](#data-flow-architecture)
3. [API Interaction Patterns](#api-interaction-patterns)
4. [Error Handling Strategy](#error-handling-strategy)
5. [Data Transformation](#data-transformation)
6. [Caching Strategies](#caching-strategies)

---

## The Service Layer Pattern

### Why a Service Layer?

Without a service layer:
```typescript
// ❌ Bad: API logic mixed into components
const Dashboard = () => {
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/portfolio');
      const json = await response.json();
      if (json.error) throw new Error(json.error);
      // Transform data...
      // Handle edge cases...
      setData(json);
    };
    fetchData();
  }, []);
};
```

**Problems:**
- Components become bloated
- Logic is duplicated across components
- Hard to test
- Hard to refactor API changes

### With a Service Layer

```typescript
// ✅ Good: Service handles all API complexity
// src/services/portfolio/portfolioService.ts
export const getPortfolio = async (userId: string): Promise<Portfolio | null> => {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching portfolio:", error);
    return null;
  }

  return assemblePortfolio(data); // Transform data
};

// Component stays thin
const Dashboard = () => {
  const { portfolio } = useDashboard(); // Hook calls service
  return <PortfolioView data={portfolio} />;
};
```

### Service Layer Rules

1. **No React imports** - Services are pure JavaScript/TypeScript
2. **Typed inputs and outputs** - Every function has clear contracts
3. **Single responsibility** - One service per domain
4. **Throw typed errors** - Callers know what can go wrong

---

## Data Flow Architecture

### The Complete Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│  ┌──────────────┐                           ┌──────────────┐       │
│  │   Page       │                           │  Component   │       │
│  │  (Route)     │───────── renders ────────▶│   (UI)       │       │
│  └──────┬───────┘                           └──────────────┘       │
│         │                                          ▲                │
│         │ uses                                     │ props          │
│         ▼                                          │                │
│  ┌──────────────┐                                  │                │
│  │    Hook      │──────── returns data ────────────┘                │
│  │  (Behavior)  │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                           │
└─────────┼───────────────────────────────────────────────────────────┘
          │ calls
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │   Service    │────▶│  Transform   │────▶│   Validate   │        │
│  │   (API)      │     │  (Shape)     │     │   (Schema)   │        │
│  └──────┬───────┘     └──────────────┘     └──────────────┘        │
│         │                                                           │
└─────────┼───────────────────────────────────────────────────────────┘
          │ fetches
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │   Supabase   │     │  REST API    │     │  LocalStorage│        │
│  │   Database   │     │  (External)  │     │  (Cache)     │        │
│  └──────────────┘     └──────────────┘     └──────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

### Flow Example: Loading a Portfolio

```
1. User navigates to /dashboard/preview
   │
2. Page renders, calls usePortfolioPreview() hook
   │
3. Hook's useEffect triggers on mount
   │
4. Hook calls getPortfolio(userId) service
   │
5. Service queries Supabase
   │
6. Supabase returns raw data
   │
7. Service transforms data (assemblePortfolio)
   │
8. Service returns Portfolio | null
   │
9. Hook updates state with data
   │
10. Hook returns { portfolio, isLoading, error }
    │
11. Page passes portfolio to <DevPortfolio /> component
    │
12. Component renders UI
```

---

## API Interaction Patterns

### Pattern 1: Basic CRUD Service

```typescript
// src/services/profile/profileService.ts

// CREATE
export const createProfile = async (
  userId: string,
  input: CreateProfileInput
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId, ...input })
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    return null;
  }

  return data;
};

// READ
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
};

// UPDATE
export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId)
    .select()
    .single();

  if (error) return null;
  return data;
};

// DELETE (if needed)
export const deleteProfile = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  return !error;
};
```

### Pattern 2: Modular Service Files

For complex domains, split into focused files:

```
services/portfolio/
├── portfolioService.ts      # Barrel file (re-exports all)
├── portfolio-fetch.ts       # Read operations
├── portfolio-mutations.ts   # Write operations
├── portfolio-assemble.ts    # Data transformation
├── portfolio-errors.ts      # Error types
└── portfolio-save.ts        # Form-specific saves
```

```typescript
// portfolioService.ts (barrel file)
export { getPortfolio, getPublicPortfolioByUsername } from "./portfolio-fetch";
export { createPortfolio, updatePortfolio } from "./portfolio-mutations";
export { assemblePortfolio } from "./portfolio-assemble";
export { PortfolioError } from "./portfolio-errors";
```

### Pattern 3: Query by Relationship

```typescript
// Fetching related data
export const getPublicPortfolioByUsername = async (
  username: string
): Promise<Portfolio | null> => {
  // First, find the profile by username
  const profile = await getProfileByUsername(username);
  if (!profile) return null;

  // Check if portfolio is published
  const { data: portfolioData } = await supabase
    .from("portfolios")
    .select("published")
    .eq("user_id", profile.id)
    .single();

  if (!portfolioData?.published) return null;

  // Fetch the full portfolio
  return getPortfolio(profile.id);
};
```

---

## Error Handling Strategy

### Typed Errors

```typescript
// src/services/portfolio/portfolio-errors.ts
export class PortfolioError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "NETWORK",
    public originalError?: unknown
  ) {
    super(message);
    this.name = "PortfolioError";
  }
}

// Usage in service
export const getPortfolio = async (userId: string) => {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error?.code === "PGRST116") {
    throw new PortfolioError("Portfolio not found", "NOT_FOUND", error);
  }

  if (error) {
    throw new PortfolioError("Failed to fetch portfolio", "NETWORK", error);
  }

  return data;
};
```

### Error Handling in Hooks

```typescript
// src/hooks/useDashboard.ts
const fetchPortfolio = async () => {
  setState("loading");

  try {
    const portfolio = await getPortfolio(user.id);
    setStats(portfolio);
    setState("success");
  } catch (err) {
    // Type-safe error handling
    if (err instanceof PortfolioError) {
      if (err.code === "NOT_FOUND") {
        setPortfolioExists(false);
        setState("success"); // Not an error state, just empty
        return;
      }
    }

    // Generic error fallback
    const message = err instanceof Error ? err.message : "Unknown error";
    setError(message);
    setState("error");
  }
};
```

### User-Facing Errors

```typescript
// Don't expose technical details to users
const getErrorMessage = (error: PortfolioError): string => {
  switch (error.code) {
    case "NOT_FOUND":
      return "Portfolio not found. Create one to get started!";
    case "UNAUTHORIZED":
      return "You don't have permission to view this portfolio.";
    case "NETWORK":
      return "Connection error. Please check your internet and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
};
```

---

## Data Transformation

### Why Transform?

API data shape ≠ UI data shape. Transform at the service layer:

```typescript
// Database returns this
{
  id: "uuid",
  user_id: "uuid",
  personal_info: { ... },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}

// UI needs this
{
  personalInfo: { ... },
  skills: [...],
  projects: [...],
  experience: [...],
  education: [...]
}
```

### The Assembly Pattern

```typescript
// src/services/portfolio/portfolio-assemble.ts
export const assemblePortfolio = async (
  portfolioData: RawPortfolioData
): Promise<Portfolio> => {
  // Fetch related data
  const [skills, projects, experience, education] = await Promise.all([
    fetchSkills(portfolioData.id),
    fetchProjects(portfolioData.id),
    fetchExperience(portfolioData.id),
    fetchEducation(portfolioData.id),
  ]);

  // Transform and validate
  return {
    personalInfo: portfolioData.personal_info,
    skills: skills.map((s) => s.name),
    projects: projects.map(transformProject),
    experience: experience.map(transformExperience),
    education: education.map(transformEducation),
  };
};

const transformProject = (raw: RawProject): Project => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  techStack: raw.tech_stack.split(",").map((t) => t.trim()),
  repoUrl: raw.repo_url || "",
  liveUrl: raw.live_url || "",
});
```

### Validation at the Boundary

```typescript
import { portfolioSchema } from "@/schemas/portfolio";

export const assemblePortfolio = async (data): Promise<Portfolio> => {
  const assembled = {
    // ... assembly logic
  };

  // Validate before returning
  const result = portfolioSchema.safeParse(assembled);

  if (!result.success) {
    console.error("Invalid portfolio data:", result.error);
    throw new PortfolioError("Data validation failed", "VALIDATION");
  }

  return result.data;
};
```

---

## Caching Strategies

### In-Memory Cache (Simple)

```typescript
// Simple cache for frequently accessed data
const profileCache = new Map<string, { data: Profile; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getProfile = async (userId: string): Promise<Profile | null> => {
  // Check cache first
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Fetch from database
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    profileCache.set(userId, { data, timestamp: Date.now() });
  }

  return data;
};
```

### Optimistic Updates

```typescript
// Update UI immediately, sync with server in background
export const usePortfolioBuilder = () => {
  const [portfolio, setPortfolio] = useState(null);

  const updateSkills = (newSkills: string[]) => {
    // Optimistic update (instant UI feedback)
    setPortfolio((prev) => ({ ...prev, skills: newSkills }));

    // Sync with server (background)
    saveSkillsToServer(newSkills).catch(() => {
      // Rollback on failure
      setPortfolio((prev) => ({ ...prev, skills: previousSkills }));
      toast({ title: "Failed to save", variant: "destructive" });
    });
  };
};
```

### Stale-While-Revalidate

```typescript
// Return cached data immediately, refresh in background
export const getPortfolioSWR = async (userId: string) => {
  const cached = await getCachedPortfolio(userId);

  // Return stale data immediately
  if (cached) {
    // Revalidate in background (non-blocking)
    revalidatePortfolio(userId);
    return cached;
  }

  // No cache, must fetch
  return getPortfolio(userId);
};
```

---

## Summary: Service Layer Principles

| Principle | Description |
|-----------|-------------|
| **Thin Components** | Components only render, never fetch |
| **Fat Hooks** | Hooks orchestrate services and manage state |
| **Pure Services** | Services are plain functions, no React |
| **Typed Contracts** | Every function has clear input/output types |
| **Transform at Boundaries** | Shape data as it enters the app |
| **Fail Gracefully** | Always handle errors, never crash |

---

## Related Documentation

- [State Management](./state-management.md) - How hooks consume service data
- [Hooks & Utilities](./hooks-utilities.md) - The orchestration layer

