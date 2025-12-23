# API & Services Documentation

This document describes the service layer APIs and their usage.

---

## Portfolio Service

**File**: `src/services/portfolio/portfolioService.ts`

### `getPortfolio(userId: string): Promise<Portfolio | null>`

Fetches a user's portfolio from the database.

**Parameters:**

- `userId` - The authenticated user's ID

**Returns:**

- `Portfolio | null` - Portfolio data or null if not found

**Throws:**

- `PortfolioServiceError` - If database operation fails

**Example:**

```typescript
const portfolio = await getPortfolio(user.id);
if (portfolio) {
  // Use portfolio data
}
```

---

### `createOrUpdatePortfolio(userId: string, portfolio: Portfolio): Promise<Portfolio>`

Creates or updates a user's portfolio in the database.

**Parameters:**

- `userId` - The authenticated user's ID
- `portfolio` - Portfolio data (validated with Zod schema)

**Returns:**

- `Portfolio` - The saved portfolio data

**Throws:**

- `PortfolioServiceError` - If validation fails or database operation fails

**Example:**

```typescript
const savedPortfolio = await createOrUpdatePortfolio(user.id, portfolioData);
```

**Notes:**

- Preserves `published` status on update
- Validates data with `portfolioSchema` before saving
- Replaces all related data (skills, projects, etc.)

---

### `getPublicPortfolioByUsername(username: string): Promise<Portfolio | null>`

Fetches a published portfolio by username for public viewing.

**Parameters:**

- `username` - The profile username

**Returns:**

- `Portfolio | null` - Portfolio data or null if not found/not published

**Throws:**

- `PortfolioServiceError` - If portfolio not found or not published

**Example:**

```typescript
const publicPortfolio = await getPublicPortfolioByUsername("johndoe");
```

---

### `updatePortfolioPublishedStatus(userId: string, published: boolean): Promise<void>`

Updates the published status of a portfolio.

**Parameters:**

- `userId` - The authenticated user's ID
- `published` - Whether the portfolio should be published

**Returns:**

- `Promise<void>`

**Throws:**

- `PortfolioServiceError` - If database operation fails

**Example:**

```typescript
await updatePortfolioPublishedStatus(user.id, true); // Publish
await updatePortfolioPublishedStatus(user.id, false); // Unpublish
```

---

### `deletePortfolioSection(userId: string, section: string): Promise<void>`

Deletes a specific section from a portfolio.

**Parameters:**

- `userId` - The authenticated user's ID
- `section` - Section to delete: `"skills" | "projects" | "experience" | "education"`

**Returns:**

- `Promise<void>`

**Throws:**

- `PortfolioServiceError` - If database operation fails

---

## Profile Service

**File**: `src/services/profile/profileService.ts`

### `getProfile(userId: string): Promise<Profile | null>`

Fetches a user's profile.

**Parameters:**

- `userId` - The authenticated user's ID

**Returns:**

- `Profile | null` - Profile data or null if not found

---

### `getProfileByUsername(username: string): Promise<Profile | null>`

Fetches a profile by username (for public portfolio lookup).

**Parameters:**

- `username` - The profile username

**Returns:**

- `Profile | null` - Profile data or null if not found

---

### `createProfile(userId: string, input: CreateProfileInput): Promise<Profile | null>`

Creates a new profile.

**Parameters:**

- `userId` - The authenticated user's ID
- `input` - Profile data (username, full_name, bio)

**Returns:**

- `Profile | null` - Created profile or null on error

---

### `updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile | null>`

Updates an existing profile.

**Parameters:**

- `userId` - The authenticated user's ID
- `input` - Profile data to update

**Returns:**

- `Profile | null` - Updated profile or null on error

---

## Analytics Service

**File**: `src/services/analytics/analyticsService.ts`

### `trackPortfolioView(userId: string): Promise<void>`

Tracks a portfolio view event.

**Parameters:**

- `userId` - The portfolio owner's user ID

**Returns:**

- `Promise<void>`

**Notes:**

- Non-blocking: Errors are logged but don't throw
- Uses RPC function for anonymous tracking support

---

### `trackResumeDownload(userId: string): Promise<void>`

Tracks a resume download event.

**Parameters:**

- `userId` - The portfolio owner's user ID

**Returns:**

- `Promise<void>`

**Notes:**

- Non-blocking: Errors are logged but don't throw
- Called when user downloads/prints resume

---

### `getPortfolioStats(userId: string): Promise<PortfolioStats>`

Fetches aggregated portfolio statistics.

**Parameters:**

- `userId` - The authenticated user's ID

**Returns:**

```typescript
{
  totalViews: number;
  resumeDownloads: number;
  lastViewed: string | null; // ISO timestamp
}
```

**Throws:**

- `AnalyticsServiceError` - If database operation fails

**Example:**

```typescript
const stats = await getPortfolioStats(user.id);
console.log(`Views: ${stats.totalViews}, Downloads: ${stats.resumeDownloads}`);
```

---

## Authentication Service

**File**: `src/services/auth/supabase-auth.ts`

### `signUpWithEmail(email: string, password: string): Promise<AuthResult>`

Creates a new user account.

**Parameters:**

- `email` - User email address
- `password` - User password

**Returns:**

```typescript
{
  user: User | null;
  error: string | null;
}
```

**Example:**

```typescript
const { user, error } = await signUpWithEmail(email, password);
if (error) {
  // Handle error
}
```

---

### `signInWithEmail(email: string, password: string): Promise<AuthResult>`

Signs in an existing user.

**Parameters:**

- `email` - User email address
- `password` - User password

**Returns:**

```typescript
{
  user: User | null;
  error: string | null;
}
```

---

### `signOut(): Promise<void>`

Signs out the current user.

**Returns:**

- `Promise<void>`

---

## Storage Service

**File**: `src/services/storage/avatarStorageService.ts`

### `uploadAvatar(userId: string, file: File): Promise<string | null>`

Uploads a user's avatar image.

**Parameters:**

- `userId` - The authenticated user's ID
- `file` - Image file to upload

**Returns:**

- `string | null` - Public URL of uploaded avatar or null on error

**Notes:**

- Validates file type (images only)
- Validates file size (max 5MB)
- Replaces existing avatar if one exists

---

### `deleteAvatar(userId: string): Promise<void>`

Deletes a user's avatar.

**Parameters:**

- `userId` - The authenticated user's ID

**Returns:**

- `Promise<void>`

---

## Error Handling

All services throw typed errors:

- `PortfolioServiceError` - Portfolio operation errors
- `AnalyticsServiceError` - Analytics operation errors

**Error Structure:**

```typescript
class ServiceError extends Error {
  code?: string;
  constructor(message: string, code?: string);
}
```

**Example Error Handling:**

```typescript
try {
  const portfolio = await getPortfolio(user.id);
} catch (error) {
  if (error instanceof PortfolioServiceError) {
    console.error(`Portfolio error: ${error.message}`, error.code);
  }
}
```

---

## Type Definitions

All service types are inferred from Zod schemas:

- `Portfolio` - From `portfolioSchema`
- `Profile` - From `profileSchema`
- `PersonalInfo`, `Project`, `Experience`, `Education` - From respective schemas

See `src/schemas/` for complete type definitions.
