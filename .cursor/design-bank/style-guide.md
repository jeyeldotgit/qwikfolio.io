# 🎨 Style Guide

## Typography

- **Primary Font:** System font stack (default Tailwind)
- **Code/Mono Font:** `font-mono` for code-style elements
- **Heading Scale:** Modular (1.25x)
- **Base Size:** 16px (1rem)

## Color Palette (Tailwind Tokens)

### Light Theme

- **Background:** `bg-slate-50` (primary), `bg-white` (cards/elevated)
- **Text:** `text-slate-900` (headings), `text-slate-600` (body), `text-slate-400` (muted)
- **Accent Primary:** `text-emerald-600`, `bg-emerald-500`, `border-emerald-500`
- **Accent Secondary:** `text-cyan-600` (gradient effects)
- **Borders:** `border-slate-200` (default), `border-slate-300` (hover)

### Dark Theme

- **Background:** `dark:bg-slate-950` (primary), `dark:bg-slate-900` (cards/elevated)
- **Text:** `dark:text-white` (headings), `dark:text-slate-300` (body), `dark:text-slate-500` (muted)
- **Accent Primary:** `dark:text-emerald-400`, `dark:bg-emerald-500`, `dark:border-emerald-500`
- **Accent Secondary:** `dark:text-cyan-400` (gradient effects)
- **Borders:** `dark:border-slate-800` (default), `dark:border-slate-700` (hover)

### Resume Theme (Light - for print)

- **Background:** `bg-white`
- **Text:** `text-slate-900` (headings), `text-slate-700` (body), `text-slate-500` (muted)
- **Borders:** `border-slate-200`

## Spacing & Layout

- **Grid:** 8px (0.5rem) base unit.
- **Container:** Max-width 1280px (`max-w-6xl`), centered.
- **Breakpoints:** Tailwind defaults (sm, md, lg, xl).
- **Sections:** `py-16` vertical padding, `px-6` horizontal.

## Effects & Animations

- **Backdrop Blur:** `backdrop-blur-xl` for sticky headers
- **Transitions:** `duration-300` default, `duration-500` for emphasis
- **Hover States:** Border color change + gradient overlay
- **Background:** Geometric grid pattern with gradient blur orbs

## Theme System

- **Hook:** `useTheme()` - returns `{ theme, resolvedTheme, setTheme, toggleTheme }`
- **Options:** `light`, `dark`, `system` (auto-follows OS preference)
- **Storage:** localStorage key `qwikfolio-theme`
- **FOUC Prevention:** Script in index.html applies theme before React hydration

## Accessibility

- **Minimum Contrast:** 4.5:1 for normal text.
- **Focus States:** High visibility rings for keyboard navigation.
- **Print Styles:** `print:hidden` for UI elements, `print:block` for resume.
- **Theme Toggle:** Proper ARIA labels for screen readers.
