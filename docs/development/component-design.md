# Component Design System

> **Study Goal**: Learn how to structure React components for maximum reusability, maintainability, and consistency.

## Table of Contents

1. [Atomic Design Methodology](#atomic-design-methodology)
2. [Component Composition](#component-composition)
3. [Props API Design](#props-api-design)
4. [Headless UI Pattern](#headless-ui-pattern)
5. [Styling Strategy](#styling-strategy)
6. [Accessibility First](#accessibility-first)

---

## Atomic Design Methodology

### The Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  TEMPLATES (Pages)                                          │
│  └── Full page layouts that compose organisms               │
├─────────────────────────────────────────────────────────────┤
│  ORGANISMS                                                  │
│  └── Complex UI sections (Header, PortfolioCard, AuthForm)  │
├─────────────────────────────────────────────────────────────┤
│  MOLECULES                                                  │
│  └── Groups of atoms (SearchBar, FormField, StatCard)       │
├─────────────────────────────────────────────────────────────┤
│  ATOMS                                                      │
│  └── Basic building blocks (Button, Input, Avatar, Badge)   │
└─────────────────────────────────────────────────────────────┘
```

### QwikFolio Examples

**Atoms** (`src/components/ui/`):

```typescript
// button.tsx - Pure presentational, highly reusable
export const Button = ({ variant, size, children, ...props }) => (
  <button className={buttonVariants({ variant, size })} {...props}>
    {children}
  </button>
);
```

**Molecules** (`src/components/form/`):

```typescript
// FormField.tsx - Composes atoms
export const FormField = ({ label, error, children }) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    {children}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);
```

**Organisms** (`src/components/dashboard/`):

```typescript
// StatCard.tsx - Individual metric card with trend indicator
export const StatCard = ({ label, value, icon, trend, trendLabel }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
        {icon}
      </div>
      {trend && <TrendBadge trend={trend} label={trendLabel} />}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </Card>
);

// AnalyticsChart.tsx - Interactive area chart for time-series data
export const AnalyticsChart = ({ data, isLoading }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <Area type="monotone" dataKey="views" fill="#10b981" />
      <Area type="monotone" dataKey="downloads" fill="#06b6d4" />
    </AreaChart>
  </ResponsiveContainer>
);

// RecentActivity.tsx - Scrollable activity feed
export const RecentActivity = ({ activities, isLoading }) => (
  <div className="max-h-[320px] overflow-y-auto">
    {activities.map((activity) => (
      <ActivityItem key={activity.id} {...activity} />
    ))}
  </div>
);
```

**Templates** (`src/pages/`):

```typescript
// dashboard/index.tsx - Composes everything with grid layout
const DashboardPage = () => {
  const { stats } = useDashboard();
  const { chartData, activities, isLoading } = useDashboardAnalytics();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Views" value={stats.totalViews} />
      <StatCard label="Downloads" value={stats.resumeDownloads} />
      <AnalyticsChart data={chartData} />
      <RecentActivity activities={activities} />
      <QuickActions />
    </div>
  );
};
```

---

## Component Composition

### The Container/Presentational Pattern

**Presentational Components** (Dumb):

- Receive data via props
- Have no business logic
- Can be reused anywhere

**Container Components** (Smart):

- Connect to hooks/context
- Handle business logic
- Pass data to presentational components

```typescript
// ✅ Presentational: Pure rendering
const UserCard = ({ name, avatar, bio }) => (
  <Card>
    <Avatar src={avatar} />
    <h2>{name}</h2>
    <p>{bio}</p>
  </Card>
);

// ✅ Container: Connects to data
const CurrentUserCard = () => {
  const { profile } = useProfile();
  return <UserCard {...profile} />;
};
```

### Compound Components Pattern

For complex components with multiple parts:

```typescript
// Usage
<Card>
  <Card.Header>
    <Card.Title>Portfolio Stats</Card.Title>
    <Card.Description>Your performance this week</Card.Description>
  </Card.Header>
  <Card.Content>{/* ... */}</Card.Content>
  <Card.Footer>
    <Button>View Details</Button>
  </Card.Footer>
</Card>;

// Implementation
const Card = ({ children, className }) => (
  <div className={cn("rounded-lg border bg-card", className)}>{children}</div>
);

Card.Header = ({ children }) => <div className="p-6 pb-0">{children}</div>;

Card.Title = ({ children }) => (
  <h3 className="font-semibold text-lg">{children}</h3>
);

// ... etc
```

### Render Props Pattern

When you need to share behavior but customize rendering:

```typescript
// The hook handles behavior
const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const handlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
  return { isHovered, handlers };
};

// Usage - caller decides how to render
const HoverCard = ({ children }) => {
  const { isHovered, handlers } = useHover();
  return (
    <div {...handlers} className={isHovered ? "scale-105" : ""}>
      {children}
    </div>
  );
};
```

---

## Props API Design

### Rule 1: Explicit Over Implicit

```typescript
// ❌ Bad: Magic string props
<Button type="primary-large-disabled" />

// ✅ Good: Explicit, typed props
<Button variant="primary" size="lg" disabled />
```

### Rule 2: Sensible Defaults

```typescript
// Component definition
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost"; // Default: "primary"
  size?: "sm" | "md" | "lg";                   // Default: "md"
  disabled?: boolean;                           // Default: false
};

// Usage - minimal props needed
<Button>Click me</Button>              // Uses all defaults
<Button variant="ghost">Cancel</Button> // Override one
```

### Rule 3: Composition Over Configuration

```typescript
// ❌ Bad: Endless config props
<Button
  leftIcon={<Mail />}
  rightIcon={<ArrowRight />}
  iconPosition="both"
  iconSize="sm"
/>

// ✅ Good: Children-based composition
<Button>
  <Mail className="mr-2 h-4 w-4" />
  Send Email
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

### Rule 4: Spread Remaining Props

```typescript
// Allow consumers to add any valid HTML attribute
type ButtonProps = {
  variant?: "primary" | "secondary";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ variant = "primary", className, ...props }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant }), className)}
    {...props} // onClick, disabled, aria-*, etc.
  />
);
```

### QwikFolio's Button Implementation

```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

// Define all variants in one place
const buttonVariants = cva(
  // Base styles (always applied)
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

---

## Headless UI Pattern

### What is Headless UI?

Components that provide **behavior without styling**. You get:

- Keyboard navigation
- Focus management
- ARIA attributes
- State management

You provide:

- All visual styling

### QwikFolio Uses Radix UI

```typescript
// src/components/ui/dialog.tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Radix provides the behavior
// We provide the styling
const DialogContent = ({ children, className }) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
    <DialogPrimitive.Content
      className={cn(
        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "bg-white rounded-lg shadow-lg p-6",
        className
      )}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);
```

### Why Headless?

| With Headless            | Without Headless           |
| ------------------------ | -------------------------- |
| Focus trap handled ✅    | Must implement manually    |
| Escape key closes ✅     | Must add event listener    |
| Click outside closes ✅  | Must detect outside clicks |
| Screen reader support ✅ | Must add ARIA attributes   |
| **Just add CSS**         | **Implement everything**   |

---

## Styling Strategy

### Tailwind + CVA (Class Variance Authority)

**Why this combination?**

- Tailwind: Utility-first, no context switching
- CVA: Type-safe variant management

```typescript
import { cva } from "class-variance-authority";

const badge = cva(
  // Base styles
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Usage with full type safety
<Badge variant="success">Published</Badge>;
```

### The `cn()` Utility

Merges Tailwind classes intelligently:

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Why twMerge matters:
cn("px-4 py-2", "px-6"); // → "py-2 px-6" (not "px-4 py-2 px-6")
```

### Dark Mode Support

```typescript
// Tailwind's dark: modifier
<div className="bg-white dark:bg-slate-900">
  <p className="text-slate-900 dark:text-white">
    Automatically adapts to theme
  </p>
</div>
```

---

## Accessibility First

### ARIA Labels

```typescript
// ✅ Good: Screen readers can understand the button
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// ❌ Bad: Screen reader just says "button"
<button>
  <X className="h-4 w-4" />
</button>
```

### Keyboard Navigation

```typescript
// Radix handles this, but if building manually:
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape") closeDialog();
  if (e.key === "Tab") trapFocus();
};
```

### Focus Management

```typescript
// When dialog opens, focus the first interactive element
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);
```

### Color Contrast

QwikFolio's style guide requires **4.5:1** contrast ratio minimum:

```typescript
// ✅ Good contrast
<p className="text-slate-900 dark:text-white">High contrast text</p>

// ❌ Bad contrast
<p className="text-slate-300">Too light, hard to read</p>
```

---

## Component Checklist

Before shipping a component, verify:

- [ ] **Props are typed** - No `any`, explicit interfaces
- [ ] **Has sensible defaults** - Works with minimal props
- [ ] **Spreads HTML attributes** - `...props` for flexibility
- [ ] **Uses `cn()` for className** - Allows overrides
- [ ] **Handles dark mode** - Uses `dark:` variants
- [ ] **Is accessible** - Has ARIA labels, keyboard support
- [ ] **Is documented** - JSDoc or Storybook stories

---

## Related Documentation

- [Hooks & Utilities](./hooks-utilities.md) - The behavior behind components
- [Environment & Infrastructure](./environment-infrastructure.md) - Tooling that enforces these patterns
