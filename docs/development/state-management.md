# State Management Strategy

> **Study Goal**: Understand the different types of state in React applications and when to use each approach.

## Table of Contents

1. [The Three Types of State](#the-three-types-of-state)
2. [Local State](#local-state-usestate)
3. [Server State](#server-state)
4. [Global State](#global-state-context)
5. [State Machine Pattern](#state-machine-pattern)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## The Three Types of State

Every piece of state in your app falls into one of three categories:

```
┌─────────────────────────────────────────────────────────────────┐
│  LOCAL STATE          │ UI-specific, single component          │
│  (useState)           │ Examples: form inputs, modal open/close│
├─────────────────────────────────────────────────────────────────┤
│  SERVER STATE         │ Data from external sources             │
│  (fetch + useState)   │ Examples: user profile, portfolio data │
│  (or TanStack Query)  │ Needs: caching, refetching, sync       │
├─────────────────────────────────────────────────────────────────┤
│  GLOBAL STATE         │ Shared across many components          │
│  (Context API)        │ Examples: auth, theme, user settings   │
│  (or Zustand)         │ Needs: accessible anywhere             │
└─────────────────────────────────────────────────────────────────┘
```

**Decision flowchart:**

```
Is this data from an API?
├── YES → Server State
└── NO → Is it needed by multiple unrelated components?
         ├── YES → Global State (Context)
         └── NO → Local State (useState)
```

---

## Local State (`useState`)

### When to Use

- Form input values
- UI toggle states (modal open, dropdown expanded)
- Temporary data that doesn't need to persist
- Animation states

### Example from QwikFolio

```typescript
// src/hooks/useAuthForm.ts
const [state, setState] = useState<AuthFormState<T>>({
  values: { email: "", password: "" },
  errors: {},
  isSubmitting: false,
});
```

### Pattern: Colocate State

**Rule**: Keep state as close to where it's used as possible.

```typescript
// ✅ Good: State lives in the component that uses it
const SearchBar = () => {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
};

// ❌ Bad: Lifting state unnecessarily high
const App = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Why is this here?
  return <SearchBar query={searchQuery} onChange={setSearchQuery} />;
};
```

### Pattern: Grouped State

When multiple pieces of state change together, group them:

```typescript
// ❌ Bad: Scattered state that changes together
const [values, setValues] = useState({});
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

// ✅ Good: Grouped into one state object
const [state, setState] = useState({
  values: {},
  errors: {},
  isSubmitting: false,
});
```

---

## Server State

### The Challenge

Server state is different from client state:

- **Asynchronous**: Needs loading/error states
- **Cached**: Shouldn't refetch unnecessarily
- **Stale**: Can become outdated
- **Shared**: Multiple components might need the same data

### QwikFolio's Approach: Custom Hooks

```typescript
// src/hooks/useDashboard.ts
export const useDashboard = (): UseDashboardResult => {
  const { user } = useAuthSession();
  const [state, setState] = useState<DashboardState>("idle");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    setState("loading");
    try {
      const data = await getPortfolio(user.id);
      setStats(data);
      setState("success");
    } catch (err) {
      setError(err.message);
      setState("error");
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  return {
    state,
    isLoading: state === "loading",
    stats,
    error,
    refetch: fetchPortfolio, // Manual refetch capability
  };
};
```

### Alternative: TanStack Query (Recommended for Scale)

For larger apps, consider TanStack Query:

```typescript
// What it would look like with TanStack Query
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["portfolio", user.id],
  queryFn: () => getPortfolio(user.id),
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

**Benefits:**

- Automatic caching
- Background refetching
- Deduplication (multiple components, one request)
- Built-in loading/error states

---

## Global State (Context)

### When to Use

- Authentication state (user, session)
- Theme (light/dark mode)
- User preferences
- Toast notifications

### Example: Auth Context

```typescript
// src/hooks/useAuthSession.tsx

// 1. Define the shape of your context
type AuthSessionContextValue = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
};

// 2. Create context with undefined default
const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined
);

// 3. Create the Provider
export const AuthSessionProvider = ({ children }) => {
  const [state, setState] = useState({
    status: "loading",
    user: null,
    session: null,
  });

  // ... setup subscription, handle auth changes ...

  return (
    <AuthSessionContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthSessionContext.Provider>
  );
};

// 4. Create the consumer hook WITH error boundary
export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      "useAuthSession must be used within an AuthSessionProvider"
    );
  }

  return context;
};
```

### Usage in App

```typescript
// src/main.tsx
<AuthSessionProvider>
  <App />
</AuthSessionProvider>;

// Any component can now access auth
const SomeComponent = () => {
  const { user, signOut } = useAuthSession();
  // ...
};
```

### Example: Theme Context

```typescript
// src/hooks/useTheme.ts
export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Apply theme class to <html>
  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    setResolvedTheme(resolved);
  }, [theme]);

  return { theme, resolvedTheme, setTheme };
};
```

---

## State Machine Pattern

### The Problem

Complex state transitions lead to bugs:

```typescript
// ❌ Bug-prone: Multiple booleans that can be in invalid states
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// What if isLoading AND isError are both true? Invalid!
```

### The Solution: State Machines

```typescript
// ✅ Better: Single state that's always valid
type State = "idle" | "loading" | "success" | "error";
const [state, setState] = useState<State>("idle");

// Derive booleans from state
const isLoading = state === "loading";
const isError = state === "error";
```

### QwikFolio's Pattern

Every data-fetching hook follows this pattern:

```typescript
// src/hooks/useDashboard.ts
type DashboardState = "idle" | "loading" | "success" | "error";

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>("idle");

  // State transitions are explicit
  const fetchData = async () => {
    setState("loading");
    try {
      // ... fetch
      setState("success");
    } catch {
      setState("error");
    }
  };

  return {
    state,
    isLoading: state === "loading", // Derived boolean
  };
};
```

### State Transition Diagram

```
       ┌───────────────────────────────────────────┐
       │                                           │
       ▼                                           │
    ┌──────┐    fetch()    ┌─────────┐            │
    │ IDLE │──────────────▶│ LOADING │            │
    └──────┘               └────┬────┘            │
                                │                  │
              ┌─────────────────┼─────────────────┐
              │ success         │ error           │
              ▼                 ▼                 │
        ┌─────────┐       ┌───────┐              │
        │ SUCCESS │       │ ERROR │──── retry ───┘
        └─────────┘       └───────┘
```

---

## Anti-Patterns to Avoid

### 1. Prop Drilling

**Problem**: Passing props through many layers

```typescript
// ❌ Bad: user passed through 5 components
<App user={user}>
  <Dashboard user={user}>
    <Sidebar user={user}>
      <Profile user={user}>
        <Avatar user={user} />
```

**Solution**: Use Context for truly global data

```typescript
// ✅ Good: Any component can access user
const Avatar = () => {
  const { user } = useAuthSession();
};
```

### 2. State in the Wrong Place

```typescript
// ❌ Bad: Global state for local UI
const [isModalOpen, setIsModalOpen] = useGlobalStore(); // Overkill!

// ✅ Good: Local state for local UI
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 3. Unnecessary State

```typescript
// ❌ Bad: Derived data stored in state
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Good: Derive during render
const fullName = `${firstName} ${lastName}`;
```

### 4. Async State in useState

```typescript
// ❌ Bad: No loading/error handling
const [user, setUser] = useState(null);

// ✅ Good: Track async states
const [state, setState] = useState("idle");
const [user, setUser] = useState(null);
const [error, setError] = useState(null);
```

---

## Summary: Decision Framework

| Question                            | Answer                                       |
| ----------------------------------- | -------------------------------------------- |
| Is it from an API?                  | Server state (custom hook or TanStack Query) |
| Does it need to survive navigation? | Global state (Context)                       |
| Is it just UI state?                | Local state (`useState`)                     |
| Can it be derived?                  | Don't store it, compute it                   |

---

## Related Documentation

- [Hooks & Utilities](./hooks-utilities.md) - How hooks implement these patterns
- [Data Flow & Services](./data-flow-services.md) - How data moves through the app
