# Git Rules – QwikFolio.io

This document defines the Git workflow, conventions, and rules used in the QwikFolio.io project. Its goal is to keep history clean, readable, and safe as the project scales.

---

## 1. Branching Strategy

### Primary Branches

- **`main`**

  - Always deployable
  - Contains only stable, reviewed code
  - No direct commits allowed

- **`dev`**

  - Integration branch for active development
  - All feature branches merge here first

---

### Supporting Branches

- **Feature branches**

  - Naming: `feature/<short-description>`
  - Examples:

    - `feature/auth-form`
    - `feature/dashboard-stats`
    - `feature/portfolio-builder`

- **Fix branches**

  - Naming: `fix/<short-description>`
  - Example: `fix/zod-validation-error`

- **Refactor branches**

  - Naming: `refactor/<scope>`
  - Example: `refactor/builder-components`

---

## 2. Commit Message Convention

Follow a **clear, imperative style**.

### Format

```
<type>: <short summary>
```

### Allowed Types

- `feat` – New feature
- `fix` – Bug fix
- `refactor` – Code refactor (no behavior change)
- `chore` – Tooling, config, cleanup
- `docs` – Documentation only
- `style` – Formatting, linting (no logic changes)

### Examples

- `feat: add schema-driven portfolio builder`
- `fix: prevent save when portfolio schema is invalid`
- `refactor: split builder into section components`
- `docs: add project implementation documentation`

---

## 3. Commit Rules

- One logical change per commit
- Commits should compile and pass basic checks
- Avoid committing commented-out code
- Do not commit temporary logs unless intentional

Bad:

```
feat: update builder
```

Good:

```
feat: add experience section to portfolio builder
```

---

## 4. Pull Request Rules

- All changes go through a Pull Request
- PRs must:

  - Target `dev`
  - Have a clear title and description
  - Reference the feature or fix being implemented

### PR Description Template

- **What was added/changed**
- **Why it was added**
- **Screenshots (if UI-related)**
- **Notes / Follow-ups**

---

## 5. File & Code Hygiene

- No secrets or API keys in commits
- `.env` files must be gitignored
- Mock data (`mockdata.json`) is allowed
- Generated files should not be committed

---

## 6. Refactor & Cleanup Policy

- Refactors must not introduce behavior changes unless explicitly stated
- Large refactors should be isolated in their own branch
- Prefer multiple small commits over one massive commit

---

## 7. Documentation Rules

- Major features must update:

  - `README.md` (if user-facing)
  - `gitrules.md` (if workflow changes)
  - Architecture docs (if structure changes)

Documentation-only changes use:

```
docs: <description>
```

---

## 8. Philosophy

- Git history should tell a story
- Commits are documentation
- Clean history > fast history

> "If it’s hard to explain in a commit message, it’s probably doing too much."
