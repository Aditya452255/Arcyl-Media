# Arcyl Media Platform - Architecture Documentation

This document explains the technical architecture, security layout, and request cycle.

## 1. Request Lifecycle Flow

```
[HTTP Request] 
      │
      ▼
[errorHandler Wrapper] ──► Generate Request ID (UUID) & Start Timer
      │
      ▼
[requestContext Store] ──► Wrap execution context (IP, User-Agent, Request ID)
      │
      ▼
[RateLimiter Check] ────► 429 Too Many Requests (if exceeded)
      │
      ▼
[Controller Layer] ─────► Extract request parameters
      │
      ▼
[Zod Validator] ────────► 400 Bad Request (if payload validation fails)
      │
      ▼
[Service Layer] ────────► Execute business logic (email templates, matching)
      │
      ▼
[Repository Layer] ─────► Database Query execution via Prisma
```

## 2. Infrastructure Highlights

### AsyncLocalStorage
Instead of passing tracking parameters through every service method, we run each request inside an `AsyncLocalStorage` instance in `errorHandler.js`. This allows the logger and API response formatter to pull the current Request ID and metadata on demand, keeping function signatures clean and readable.

### Centralized Exception Masking
All raw system/database/SQL errors are caught by `withErrorHandler`.
* The server logs the detailed exception stack through the structured Pino logger for developer troubleshooting.
* The client receives a sanitized, generic `500 Internal Server Error` response to block database schema leaks.
