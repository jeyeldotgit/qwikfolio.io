# Schemas & Data Models

## Auth Schema

**File:** `schemas/auth.ts`

Fields:

- email
- password

Rules:

- Valid email format
- Password length constraints

---

## Portfolio Schemas

**File:** `schemas/portfolio.ts`

Schemas:

- personalInfoSchema
- skillSchema
- projectSchema
- experienceSchema
- educationSchema
- portfolioSchema

---

## Portfolio Model

```ts
Portfolio {
  personalInfo
  skills[]
  projects[]
  experience[]
  education[]
}
```
