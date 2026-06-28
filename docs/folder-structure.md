# Arcyl Media Platform - Folder Structure Description

This document explains the organization of the codebase.

```
src/
 ├── app/             # Next.js App Router pages and API routes
 │    └── api/        # REST API endpoints (e.g. contact/)
 ├── components/      # UI components (Layout, Sections, UI primitives)
 ├── config/          # Configurations (db/Prisma, Cloudinary, Resend)
 ├── controllers/     # Controller layer adapters (extract parameters, format responses)
 ├── middleware/      # Global middleware (centralized error handling, CORS, JWT auth)
 ├── repositories/    # Direct database queries and access abstraction (Prisma queries)
 ├── services/        # Decoupled business logic engine
 ├── validators/      # Zod validation schemas
 ├── utils/           # Shared general utilities (logger, API response wrapper, error models)
 └── lib/             # Shared constants and low-level third party setups
prisma/               # Prisma schema and database migration scripts
docs/                 # Comprehensive design, architecture, and roadmap markdown docs
```
