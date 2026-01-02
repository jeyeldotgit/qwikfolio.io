# Hooks & Utilities

> **Study Goal**: Master the art of extracting and organizing logic in React applications using custom hooks and pure utility functions.

## Table of Contents

1. [The Hook Philosophy](#the-hook-philosophy)
2. [Custom Hook Patterns](#custom-hook-patterns)
3. [Hook Design Guidelines](#hook-design-guidelines)
4. [Utility Functions](#utility-functions)
5. [Real-World Examples](#real-world-examples)
6. [Testing Hooks](#testing-hooks)

---

## The Hook Philosophy

### What Hooks Are For

```
┌─────────────────────────────────────────────────────────────┐
│  HOOKS = Reusable behavior that needs React's lifecycle    │
│                                                             │
│  ✅ State management (useState)                             │
│  ✅ Side effects (useEffect)                                │
│  ✅ Context consumption (useContext)                        │
│  ✅ Refs and DOM access (useRef)                            │
│  ✅ Subscriptions and event listeners                       │
│  ✅ Data fetching coordination                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  UTILITIES = Pure functions with no React dependency       │
│                                                             │
│  ✅ String manipulation                                     │
│  ✅ Date formatting                                         │
│  ✅ Math calculations                                       │
│  ✅ Array/Object transformations                            │
│  ✅ Validation logic (without state)                        │
└─────────────────────────────────────────────────────────────┘
```

### The Decision Tree

```
Does this logic need React's lifecycle (state, effects, context)?
├── YES → Make it a custom hook
└── NO → Make it a utility function
```

---

## Custom Hook Patterns

### Pattern 1: Data Fetching Hook

The most common pattern. Encapsulates loading, error, and success states.

```typescript
// src/hooks/usePortfolioPreview.ts
type PortfolioPreviewState = "idle" | "loading" | "success" | "error";

type UsePortfolioPreviewResult = {
  state: PortfolioPreviewState;
  isLoading: boolean;
  portfolio: Portfolio | null;
  error: string | null;
};

export const usePortfolioPreview = (): UsePortfolioPreviewResult => {
  const { user } = useAuthSession(); // Consume another hook
  const [state, setState] = useState<PortfolioPreviewState>("idle");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setState("idle");
      return;
    }

    const loadPortfolio = async () => {
      setState("loading");

      try {
        const data = await getPortfolio(user.id); // Call service
        setPortfolio(data);
        setState("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
        setState("error");
      }
    };

    loadPortfolio();
  }, [user]);

  return {
    state,
    isLoading: state === "loading",
    portfolio,
    error,
  };
};
```

### Pattern 2: Form Hook

Manages form state, validation, and submission.

```typescript
// src/hooks/useAuthForm.ts
export const useAuthForm = <T extends "signIn" | "signUp">(mode: T) => {
  const [state, setState] = useState({
    values: mode === "signUp"
      ? { email: "", password: "", confirmPassword: "" }
      : { email: "", password: "" },
    errors: {},
    isSubmitting: false,
  });

  const handleChange = (field: string, value: string) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      errors: { ...prev.errors, [field]: undefined }, // Clear field error
    }));
  };

  const handleSubmit = (onValid: (values) => void) => (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const schema = mode === "signUp" ? signUpSchema : signInSchema;
    const result = schema.safeParse(state.values);

    if (!result.success) {
      // Extract errors from Zod
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setState((prev) => ({ ...prev, errors: fieldErrors }));
      return;
    }

    // Valid - call the callback
    setState((prev) => ({ ...prev, isSubmitting: true }));
    onValid(result.data);
  };

  return { ...state, handleChange, handleSubmit };
};
```

### Pattern 3: Context + Provider Hook

Global state that needs to be accessed anywhere.

```typescript
// src/hooks/useAuthSession.tsx

// 1. Create Context
const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined
);

// 2. Create Provider
export const AuthSessionProvider = ({ children }) => {
  const [state, setState] = useState({
    status: "loading",
    user: null,
    session: null,
  });

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges((session) => {
      if (session) {
        setState({ status: "authenticated", user: session.user, session });
      } else {
        setState({ status: "unauthenticated", user: null, session: null });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthSessionContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthSessionContext.Provider>
  );
};

// 3. Create Consumer Hook
export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return context;
};
```

### Pattern 4: Reducer-Based Hook

For complex state with many actions (like Toast system).

```typescript
// src/hooks/useToast.ts

// Define action types
type Action =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; toastId: string }
  | { type: "REMOVE_TOAST"; toastId: string };

// Reducer function (pure!)
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t
        ),
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

// Hook uses reducer
export const useToast = () => {
  const [state, dispatch] = useReducer(reducer, { toasts: [] });

  const toast = (props: ToastProps) => {
    const id = generateId();
    dispatch({ type: "ADD_TOAST", toast: { ...props, id } });
    return { id, dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }) };
  };

  return { toasts: state.toasts, toast };
};
```

### Pattern 5: Local Storage Sync Hook

Persist state across sessions.

```typescript
// src/hooks/useTheme.ts
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem("theme");
    return stored === "dark" || stored === "light" ? stored : "system";
  });

  useEffect(() => {
    // Sync to localStorage
    localStorage.setItem("theme", theme);

    // Apply to DOM
    const resolved = theme === "system" ? getSystemTheme() : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [theme]);

  return { theme, setTheme: setThemeState };
};
```

---

## Hook Design Guidelines

### Rule 1: Return Objects, Not Tuples

```typescript
// ❌ Bad: Order matters, hard to extend
const [data, loading, error] = useFetch();

// ✅ Good: Named properties, easy to extend
const { data, isLoading, error, refetch } = useFetch();
```

### Rule 2: Derive, Don't Duplicate

```typescript
// ❌ Bad: Duplicate state
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// ✅ Good: Single state, derived booleans
const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
return {
  state,
  isLoading: state === "loading",
  isError: state === "error",
  isSuccess: state === "success",
};
```

### Rule 3: Accept Configuration, Return API

```typescript
// Hook accepts config
const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const debouncedSearch = useDebounce(searchTerm, 500);
```

### Rule 4: Clean Up Side Effects

```typescript
useEffect(() => {
  // Subscribe
  const subscription = eventEmitter.subscribe(handleEvent);

  // ✅ Always return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Rule 5: Memoize Callbacks

```typescript
// ❌ Bad: New function every render
const handleClick = () => doSomething(id);

// ✅ Good: Stable function reference
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

---

## Utility Functions

### What Makes a Good Utility?

1. **Pure** - Same input → Same output
2. **No Side Effects** - Doesn't modify external state
3. **No React** - Can be used anywhere
4. **Single Purpose** - Does one thing well
5. **Well Typed** - Clear input/output types

### QwikFolio's Core Utility

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names intelligently, handling Tailwind conflicts
 *
 * @example
 * cn("px-4", "px-6") // → "px-6" (not "px-4 px-6")
 * cn("text-red-500", isError && "text-red-700") // Conditional classes
 * cn(buttonBase, buttonVariants[variant]) // Compose variants
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Common Utility Patterns

```typescript
// src/lib/utils.ts (extended)

/**
 * Format a date for display
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
};

/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};
```

---

## Real-World Examples

### Example 1: Dashboard Hook

```typescript
// src/hooks/useDashboard.ts
export const useDashboard = (): UseDashboardResult => {
  const { user } = useAuthSession();
  const [state, setState] = useState<DashboardState>("idle");
  const [portfolioExists, setPortfolioExists] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    if (!user) {
      setState("idle");
      setPortfolioExists(false);
      setStats(null);
      return;
    }

    setState("loading");

    try {
      const portfolio = await getPortfolio(user.id);

      if (portfolio) {
        const [portfolioData, analyticsStats] = await Promise.all([
          supabase.from("portfolios").select("published").eq("user_id", user.id).single(),
          getPortfolioStats(user.id),
        ]);

        setPortfolioExists(true);
        setStats({
          totalViews: analyticsStats.totalViews,
          resumeDownloads: analyticsStats.resumeDownloads,
          lastViewed: analyticsStats.lastViewed,
          status: portfolioData?.data?.published ? "published" : "draft",
        });
        setState("success");
      } else {
        setPortfolioExists(false);
        setStats(null);
        setState("success");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setState("error");
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  return {
    state,
    isLoading: state === "loading",
    portfolioExists,
    stats,
    error,
    refetch: fetchPortfolio,
  };
};
```

### Example 2: Theme Hook with System Detection

```typescript
// src/hooks/useTheme.ts
const STORAGE_KEY = "qwikfolio-theme";

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    theme === "system" ? getSystemTheme() : theme
  );

  // Apply theme when it changes
  useEffect(() => {
    const newResolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(newResolved);

    document.documentElement.classList.toggle("dark", newResolved === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const newResolved = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        document.documentElement.classList.toggle("dark", newResolved === "dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeState,
    toggleTheme: () =>
      setThemeState((prev) =>
        prev === "light" ? "dark" : prev === "dark" ? "light" : getSystemTheme() === "dark" ? "light" : "dark"
      ),
  };
};
```

---

## Testing Hooks

### Testing with React Testing Library

```typescript
// __tests__/useAuthForm.test.ts
import { renderHook, act } from "@testing-library/react";
import { useAuthForm } from "@/hooks/useAuthForm";

describe("useAuthForm", () => {
  it("initializes with empty values", () => {
    const { result } = renderHook(() => useAuthForm("signIn"));

    expect(result.current.values).toEqual({
      email: "",
      password: "",
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("updates values on change", () => {
    const { result } = renderHook(() => useAuthForm("signIn"));

    act(() => {
      result.current.handleChange("email", "test@example.com");
    });

    expect(result.current.values.email).toBe("test@example.com");
  });

  it("validates on submit", () => {
    const { result } = renderHook(() => useAuthForm("signIn"));
    const onValid = jest.fn();

    act(() => {
      result.current.handleSubmit(onValid)({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.errors.email).toBeDefined();
    expect(onValid).not.toHaveBeenCalled();
  });
});
```

---

## Summary

| Concept | Use When |
|---------|----------|
| **Custom Hook** | Logic needs React lifecycle (state, effects, context) |
| **Utility Function** | Pure transformation, no React needed |
| **Context Hook** | Global state needed by many components |
| **Form Hook** | Managing form state and validation |
| **Data Hook** | Fetching and caching server data |

---

## Related Documentation

- [State Management](./state-management.md) - State patterns these hooks implement
- [Data Flow & Services](./data-flow-services.md) - Services that hooks consume

