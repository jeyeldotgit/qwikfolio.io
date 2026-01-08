# v1 Technical Architecture

## Overview

This document describes the technical architecture of QwikFolio v1, including infrastructure, scaling strategies, and security measures. This represents the evolution from Beta's "move fast" approach to v1's production-ready architecture.

**Last Updated**: January 2025  
**Target Audience**: Developers, DevOps, Technical Leads

---

## Table of Contents

1. [Infrastructure Diagram](#infrastructure-diagram)
2. [Scaling Logic](#scaling-logic)
3. [Security & Compliance](#security--compliance)
4. [Performance Optimizations](#performance-optimizations)
5. [Monitoring & Observability](#monitoring--observability)

---

## Infrastructure Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile Web  │  │  Public API  │      │
│  │  (React)     │  │  (Responsive)│  │  (Future)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Vite Dev Server / Vercel                │   │
│  │  - React Router (Client-side routing)                │   │
│  │  - React Query (Data fetching/caching)              │   │
│  │  - Zustand/Context (State management)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Supabase (Backend-as-a-Service)         │   │
│  │  - PostgreSQL Database                               │   │
│  │  - Row Level Security (RLS)                          │   │
│  │  - Authentication (Supabase Auth)                     │   │
│  │  - Real-time Subscriptions (Future)                  │   │
│  │  - Storage (Profile photos, media)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Portfolios  │  │   Profiles   │  │  Analytics   │      │
│  │  Skills      │  │   Projects   │  │  Events      │      │
│  │  Experience  │  │  Education   │  │  Certifications│    │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │    Hooks     │      │
│  │              │  │              │  │              │      │
│  │ - Landing    │  │ - Forms      │  │ - useAuth    │      │
│  │ - Dashboard  │  │ - Preview    │  │ - usePortfolio│     │
│  │ - Builder    │  │ - UI         │  │ - useProfile │      │
│  │ - Public     │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │   Schemas     │  │   Utils      │      │
│  │              │  │              │  │              │      │
│  │ - Portfolio  │  │ - Zod        │  │ - Theme      │      │
│  │ - Profile    │  │ - Validation  │  │ - Formatting│      │
│  │ - Analytics  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Supabase + PostgreSQL)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Database   │  │   Auth       │  │   Storage    │      │
│  │              │  │              │  │              │      │
│  │ - Tables     │  │ - JWT        │  │ - Files      │      │
│  │ - RLS        │  │ - Sessions   │  │ - Images     │      │
│  │ - Functions  │  │ - Providers  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Scaling Logic

### Current Capacity (v1)

**Target Load**:
- **Users**: 1,000+ concurrent users
- **Portfolios**: 10,000+ portfolios
- **Requests**: 100,000+ requests/day
- **Database**: PostgreSQL (Supabase managed)

### Scaling Strategies

#### 1. Database Scaling

**Current**: Single PostgreSQL instance (Supabase managed)

**Scaling Approach**:
- **Vertical Scaling**: Supabase handles instance upgrades automatically
- **Connection Pooling**: Supabase manages connection pooling
- **Read Replicas**: Available for read-heavy workloads (future)
- **Indexing**: Strategic indexes on frequently queried columns
  - `portfolios.slug` (unique index)
  - `portfolios.user_id` (indexed)
  - `profiles.username` (unique index)
  - `portfolio_analytics.user_id` (indexed)

**Query Optimization**:
- Use `.maybeSingle()` instead of `.single()` to avoid errors
- Batch queries with `Promise.all()` where possible
- Limit result sets with pagination (future)
- Use JSONB indexes for settings/theme queries

#### 2. Frontend Scaling

**Current**: Static site generation with client-side routing

**Scaling Approach**:
- **CDN**: Vercel/Netlify CDN for static assets
- **Code Splitting**: React lazy loading for routes
- **Caching**: Browser caching for static assets
- **Debouncing**: Autosave debounced to 2s to reduce API calls

**Performance Optimizations**:
- React.memo for expensive components
- useMemo/useCallback for expensive computations
- Virtual scrolling for long lists (future)
- Image optimization (WebP, lazy loading)

#### 3. API Scaling

**Current**: Supabase REST API (managed)

**Scaling Approach**:
- **Rate Limiting**: Supabase handles rate limiting
- **Caching**: Client-side caching with React Query (future)
- **Batch Operations**: Batch saves where possible
- **Optimistic Updates**: UI updates before API confirmation

#### 4. Storage Scaling

**Current**: Supabase Storage (S3-compatible)

**Scaling Approach**:
- **CDN**: Supabase Storage includes CDN
- **Image Optimization**: Client-side compression before upload
- **Lazy Loading**: Images loaded on demand
- **Storage Limits**: Monitor usage, implement cleanup (future)

### Scaling Metrics

| Metric | Beta | v1 Target | v2 Plan |
|--------|------|-----------|---------|
| **Concurrent Users** | 10-50 | 1,000+ | 10,000+ |
| **Database Size** | <1GB | <10GB | <100GB |
| **Response Time** | 500ms | <200ms | <100ms |
| **Uptime** | 95% | 99.9% | 99.99% |
| **API Rate Limit** | N/A | 10 req/s | 100 req/s |

---

## Security & Compliance

### Authentication & Authorization

#### JWT Handling

**Implementation**:
- Supabase Auth manages JWT tokens
- Tokens stored in httpOnly cookies (recommended) or localStorage
- Automatic token refresh handled by Supabase client
- Token expiration: 1 hour (default)

**Security Measures**:
- HTTPS only (enforced by Supabase)
- CSRF protection via SameSite cookies
- Token rotation on refresh
- Secure password requirements (enforced by Supabase)

#### Row Level Security (RLS)

**Policies Implemented**:

1. **Portfolios**:
   ```sql
   -- Users can only edit their own portfolio
   CREATE POLICY "Users can update own portfolio"
     ON portfolios FOR UPDATE
     USING (auth.uid() = user_id);
   
   -- Public can view published portfolios
   CREATE POLICY "Public can view published portfolios"
     ON portfolios FOR SELECT
     USING (
       published = true 
       OR (settings->>'isPublic')::boolean = true
     );
   ```

2. **Skills, Projects, Experience, Education**:
   - Users can only modify their own data
   - Public can view if portfolio is published

3. **Analytics**:
   - Users can view their own analytics
   - Public can insert view events (for tracking)

**Benefits**:
- Database-level security (can't be bypassed)
- No need for application-level permission checks
- Automatic enforcement on all queries

### Data Protection

#### Encryption

- **At Rest**: Supabase encrypts all data at rest (AES-256)
- **In Transit**: TLS 1.3 for all connections
- **Sensitive Fields**: Email addresses, phone numbers stored encrypted

#### Input Validation

**Client-Side**:
- Zod schema validation on all forms
- TypeScript type checking
- XSS prevention via React's built-in escaping

**Server-Side**:
- Supabase validates all inputs
- RLS policies prevent unauthorized access
- SQL injection prevention via parameterized queries

#### Rate Limiting

**Current Implementation**:
- Supabase rate limiting: 10 requests/second per IP
- Client-side debouncing: 2s for autosave
- Future: Custom rate limiting per user tier

### Compliance

#### GDPR Compliance

**Data Handling**:
- User data stored in EU (Supabase EU region)
- Right to deletion: Users can delete their account
- Data export: Users can export their portfolio data
- Privacy policy: Required for user registration

**Cookies**:
- Minimal cookie usage (auth tokens only)
- No tracking cookies without consent
- Clear cookie policy

#### Security Best Practices

1. **Dependency Management**:
   - Regular security audits via `npm audit`
   - Automated dependency updates (Dependabot)
   - Pinned dependency versions

2. **Error Handling**:
   - No sensitive data in error messages
   - Error logging (without user data)
   - Graceful degradation

3. **Secrets Management**:
   - Environment variables for all secrets
   - No secrets in code or version control
   - Supabase keys stored securely

---

## Performance Optimizations

### Database Optimizations

1. **Indexes**:
   - Unique index on `portfolios.slug`
   - Index on `portfolios.user_id`
   - Index on `profiles.username`
   - Index on `portfolio_analytics.user_id`

2. **Query Optimization**:
   - Use `.maybeSingle()` to avoid errors
   - Batch related queries with `Promise.all()`
   - Limit result sets (pagination future)
   - Use JSONB operators efficiently

3. **Connection Pooling**:
   - Supabase manages connection pooling
   - Reuse connections where possible
   - Monitor connection usage

### Frontend Optimizations

1. **Code Splitting**:
   - Route-based code splitting
   - Lazy load heavy components
   - Dynamic imports for large libraries

2. **Caching**:
   - Browser caching for static assets
   - Service worker for offline support (future)
   - React Query for API response caching (future)

3. **Rendering**:
   - React.memo for expensive components
   - useMemo for expensive computations
   - Virtual scrolling for long lists (future)

4. **Asset Optimization**:
   - Image compression before upload
   - WebP format support
   - Lazy loading for images
   - CDN for all static assets

### API Optimizations

1. **Request Batching**:
   - Batch portfolio saves
   - Use `Promise.all()` for parallel requests
   - Debounce autosave (2s)

2. **Response Caching**:
   - Cache public portfolio data (future)
   - Cache user profile data
   - Invalidate cache on updates

---

## Monitoring & Observability

### Current Monitoring

**Supabase Dashboard**:
- Database performance metrics
- API request logs
- Error tracking
- Storage usage

**Browser Console**:
- Client-side error logging
- Migration debug logs
- Performance timing

### Future Monitoring (v2)

1. **Application Performance Monitoring (APM)**:
   - Response time tracking
   - Error rate monitoring
   - User session replay

2. **Logging**:
   - Structured logging (JSON)
   - Log aggregation (e.g., LogRocket, Sentry)
   - Error tracking with stack traces

3. **Analytics**:
   - User behavior tracking
   - Performance metrics
   - Conversion funnel analysis

4. **Alerts**:
   - Error rate thresholds
   - Performance degradation alerts
   - Database connection alerts

---

## Deployment Architecture

### Current Setup

**Frontend**: Vercel/Netlify
- Automatic deployments from Git
- Preview deployments for PRs
- Edge network for global CDN

**Backend**: Supabase
- Managed PostgreSQL
- Automatic backups
- Multi-region support (future)

### CI/CD Pipeline

```
Git Push → GitHub Actions → Build → Test → Deploy
                                    ↓
                            Vercel/Netlify
                                    ↓
                            Production
```

**Steps**:
1. Code pushed to `main` branch
2. GitHub Actions runs tests
3. Build production bundle
4. Deploy to Vercel/Netlify
5. Run smoke tests
6. Monitor for errors

---

## Disaster Recovery

### Backup Strategy

**Database**:
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backup before major migrations

**Code**:
- Git repository (GitHub)
- Version tags for releases
- Rollback capability

### Recovery Procedures

1. **Database Failure**:
   - Restore from Supabase backup
   - Point-in-time recovery if needed
   - Verify data integrity

2. **Code Deployment Failure**:
   - Rollback to previous version
   - Fix issues in staging
   - Redeploy after verification

3. **Data Corruption**:
   - Restore from backup
   - Re-run migrations if needed
   - Verify data integrity

---

## Future Architecture Considerations

### Planned Improvements (v2+)

1. **Microservices** (if needed):
   - Separate analytics service
   - Separate media processing service
   - API gateway for routing

2. **Caching Layer**:
   - Redis for session storage
   - CDN for static assets
   - Application-level caching

3. **Real-time Features**:
   - WebSocket support (Supabase Realtime)
   - Live collaboration (future)
   - Real-time analytics

4. **Multi-region**:
   - Database replicas in multiple regions
   - Edge functions for low latency
   - Regional data compliance

---

**Document Version**: 1.0  
**Last Updated**: January 2025

