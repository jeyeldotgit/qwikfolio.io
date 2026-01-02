# Environment & Infrastructure

> **Study Goal**: Understand the tooling and configuration that makes a professional React codebase maintainable, consistent, and deployable.

## Table of Contents

1. [TypeScript Configuration](#typescript-configuration)
2. [Build Tool (Vite)](#build-tool-vite)
3. [Linting & Formatting](#linting--formatting)
4. [Path Aliases](#path-aliases)
5. [Environment Variables](#environment-variables)
6. [Testing Strategy](#testing-strategy)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Deployment](#deployment)

---

## TypeScript Configuration

### Why TypeScript?

TypeScript isn't just "JavaScript with types." It's:
- **Documentation** - Types tell you how code works
- **Refactoring Safety** - Change code confidently
- **IDE Superpowers** - Autocomplete, jump-to-definition
- **Bug Prevention** - Catch errors before runtime

### QwikFolio's TypeScript Config

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    /* Type Checking */
    "strict": true,                    // Enable all strict checks
    "noUnusedLocals": true,           // Error on unused variables
    "noUnusedParameters": true,       // Error on unused function params
    "noFallthroughCasesInSwitch": true, // Error on switch fallthrough

    /* Module Resolution */
    "moduleResolution": "bundler",    // Use Vite's module resolution
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,        // Allow importing JSON

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]              // Enable @/components/... imports
    },

    /* Output */
    "target": "ES2020",               // Modern JavaScript output
    "module": "ESNext",               // ES modules
    "jsx": "react-jsx",               // Modern JSX transform

    /* Libraries */
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Key Strict Mode Checks

```typescript
// strict: true enables these:

// 1. noImplicitAny - Must type everything
// ❌ const fn = (x) => x * 2;
// ✅ const fn = (x: number) => x * 2;

// 2. strictNullChecks - Handle null/undefined
// ❌ const name = user.name; // Error if user might be null
// ✅ const name = user?.name ?? "Unknown";

// 3. strictFunctionTypes - Function compatibility
// Prevents subtle bugs with callbacks

// 4. strictPropertyInitialization - Class properties
// Must initialize or declare in constructor
```

### The `any` Ban

```typescript
// ❌ NEVER use any
const data: any = fetchData();
const processData = (input: any) => { ... }

// ✅ Use proper types
const data: Portfolio = fetchData();
const processData = (input: Portfolio) => { ... }

// ✅ Use unknown for truly unknown data
const parseJson = (json: string): unknown => JSON.parse(json);

// ✅ Use generics for flexible typing
const getValue = <T>(key: string): T | null => { ... }
```

---

## Build Tool (Vite)

### Why Vite?

| Feature | Vite | Create React App |
|---------|------|------------------|
| Dev server start | ~300ms | ~10s+ |
| Hot Module Reload | Instant | Seconds |
| Build time | Fast | Slow |
| Config | Minimal | Ejection hell |

### QwikFolio's Vite Config

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),           // React Fast Refresh
    tailwindcss(),     // Tailwind CSS v4
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Path alias
    },
  },
  server: {
    port: 5173,        // Default dev port
    open: true,        // Open browser on start
  },
  build: {
    outDir: "dist",    // Build output directory
    sourcemap: true,   // Enable source maps for debugging
  },
});
```

### How Vite Works

```
Development Mode:
┌─────────────────────────────────────────────────────────────┐
│  Browser requests /src/App.tsx                              │
│  ↓                                                          │
│  Vite intercepts request                                    │
│  ↓                                                          │
│  Transforms TSX → JS on-demand (no bundle!)                 │
│  ↓                                                          │
│  Serves as ES Module                                        │
│  ↓                                                          │
│  Browser runs native ES imports                             │
└─────────────────────────────────────────────────────────────┘

Production Build:
┌─────────────────────────────────────────────────────────────┐
│  vite build                                                 │
│  ↓                                                          │
│  Rollup bundles all code                                    │
│  ↓                                                          │
│  Tree-shaking removes unused code                           │
│  ↓                                                          │
│  Code splitting for optimal loading                         │
│  ↓                                                          │
│  Output: dist/assets/index-[hash].js                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Linting & Formatting

### ESLint Configuration

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Fast Refresh compatibility
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript specific
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  }
);
```

### Key ESLint Rules

```typescript
// react-hooks/rules-of-hooks
// ❌ Conditional hook call
if (condition) {
  const [state, setState] = useState(); // Error!
}

// ✅ Hooks at top level only
const [state, setState] = useState();
if (condition) { /* use state */ }


// react-hooks/exhaustive-deps
// ❌ Missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // Warning: userId should be in deps

// ✅ All dependencies listed
useEffect(() => {
  fetchData(userId);
}, [userId]);


// @typescript-eslint/no-explicit-any
// ❌ Using any
const data: any = response;

// ✅ Proper typing
const data: Portfolio = response;
```

### Prettier (Code Formatting)

```json
// .prettierrc (optional - many use ESLint alone)
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Running Linting

```bash
# Check for issues
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## Path Aliases

### The Problem

```typescript
// ❌ Ugly relative imports
import { Button } from "../../../../components/ui/button";
import { useAuth } from "../../../hooks/useAuth";
```

### The Solution

```typescript
// ✅ Clean aliased imports
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
```

### Configuration

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Environment Variables

### Vite's Environment Variable System

```bash
# .env (all environments)
VITE_APP_NAME=QwikFolio

# .env.local (local only, git-ignored)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# .env.production (production builds)
VITE_API_URL=https://api.qwikfolio.io
```

### Accessing Variables

```typescript
// Must be prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Type safety for env vars
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}
```

### Security Rules

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ VITE_ prefixed vars are EXPOSED to the browser!        │
│                                                             │
│  ✅ Safe to expose:                                         │
│     - VITE_SUPABASE_URL                                    │
│     - VITE_SUPABASE_ANON_KEY (designed to be public)       │
│     - VITE_API_URL                                         │
│                                                             │
│  ❌ NEVER expose:                                           │
│     - Database passwords                                    │
│     - Service role keys                                     │
│     - API secrets                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Testing Pyramid

```
              ┌─────────────┐
              │   E2E       │  Few, slow, high confidence
              │ (Playwright)│  Test critical user flows
              ├─────────────┤
              │ Integration │  Some, medium speed
              │  (Vitest)   │  Test component interactions
              ├─────────────┤
              │    Unit     │  Many, fast, focused
              │  (Vitest)   │  Test functions/hooks in isolation
              └─────────────┘
```

### Unit Tests with Vitest

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatDate, truncate, cn } from "@/lib/utils";

describe("formatDate", () => {
  it("formats date correctly", () => {
    expect(formatDate("2024-01-15")).toBe("Jan 2024");
  });
});

describe("truncate", () => {
  it("truncates long text", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("returns short text unchanged", () => {
    expect(truncate("Hi", 5)).toBe("Hi");
  });
});

describe("cn", () => {
  it("merges classes correctly", () => {
    expect(cn("px-4", "px-6")).toBe("px-6"); // Later wins
    expect(cn("text-red-500", false && "text-blue-500")).toBe("text-red-500");
  });
});
```

### Hook Tests

```typescript
// __tests__/useTheme.test.ts
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "@/hooks/useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to system theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("system");
  });

  it("toggles between light and dark", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("dark"));
    expect(result.current.resolvedTheme).toBe("dark");

    act(() => result.current.setTheme("light"));
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("dark"));

    expect(localStorage.getItem("qwikfolio-theme")).toBe("dark");
  });
});
```

### E2E Tests with Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can sign in", async ({ page }) => {
    await page.goto("/auth");

    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/auth");

    await page.fill('[name="email"]', "wrong@example.com");
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator(".error-message")).toBeVisible();
  });
});
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

### Pre-commit Hooks (Husky)

```bash
# Install Husky
npm install husky lint-staged --save-dev

# .husky/pre-commit
#!/bin/sh
npx lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Deployment

### Vercel Configuration

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Why rewrites?** Single Page Apps need all routes to serve `index.html`, then React Router handles routing client-side.

### Build Output

```
dist/
├── index.html           # Entry point
├── assets/
│   ├── index-[hash].js  # App bundle (code-split)
│   ├── index-[hash].css # Styles
│   └── vendor-[hash].js # Dependencies
└── [static files]       # Images, fonts, etc.
```

### Environment Variables in Production

```bash
# Set in Vercel dashboard or CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

---

## Summary: Professional Tooling Checklist

| Tool | Purpose | QwikFolio Uses |
|------|---------|----------------|
| **TypeScript** | Type safety | ✅ Strict mode |
| **Vite** | Build tool | ✅ Fast dev, optimized builds |
| **ESLint** | Code quality | ✅ + React Hooks plugin |
| **Prettier** | Formatting | Optional |
| **Husky** | Git hooks | Recommended |
| **Vitest** | Unit tests | Recommended |
| **Playwright** | E2E tests | Recommended |
| **GitHub Actions** | CI/CD | Recommended |
| **Vercel** | Deployment | ✅ |

---

## Related Documentation

- [Architecture](./architecture.md) - How code is organized
- [Component Design](./component-design.md) - How components are built

