# Arcyl Media Platform - Project Roadmap

## Phase 1 & 1.5 - Core Foundation & Hardening (Completed)
* Next.js 15 App Router & React 19 Upgrade.
* Prisma PostgreSQL schema with User, Lead, ContactSubmission, and ActivityLog models.
* Configured Resend email, Cloudinary storage, Zod validations, and Pino logger.
* Strict startup env validation.
* Request context tracking with `AsyncLocalStorage` and logging mixins.
* Centralized API response format and masked server error middleware.
* Decoupled email HTML templates.
* Endpoint rate limiting (5 requests / 10 minutes for Contact API).
* Interactive Swagger API docs served at `/api/docs`.

## Phase 2 - CRM, Admin Dashboard & Authentication (Next)
* Hashed user session logins using bcryptjs and JSON Web Tokens (JWT).
* Dynamic administration panel for managing captured leads.
* Client pipeline dashboard (status progression: `NEW` -> `CONTACTED` -> `QUALIFIED` -> `LOST`).
* Complete audit activity ledger UI filterable by users, routes, and dates.
* Cloudinary file-sharing catalog system for agency assets.

## Phase 3 - Client Portal & Projects
* client workspace modules.
* Document collaboration, milestone tracking, and task lists.
* Stripe billing, subscriptions, and custom agency invoices.

## Phase 4 - AI Agency Automation & SaaS Multi-tenancy
* Content generation AI agents.
* Automated newsletters and email marketing analytics.
* Multi-tenant data isolation and dynamic subdomain mappings.
