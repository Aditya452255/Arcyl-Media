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

## Phase 2 - CRM, Admin Dashboard, Dynamic CMS & Authentication (Completed)
* Authentication: JWT access/refresh tokens in HttpOnly cookies, password resets, email dispatches.
* RBAC: Custom user Role, Permission, RolePermission, UserRole tables enforcing node-based checking.
* Dynamic CMS: Generic repository for 11 CMS content types (Heros, FAQs, Services, Portfolio, etc.).
* CRM Leads: Paginated lists, search index, note trails, user assignment, pipeline statuses.
* Media library: Streams uploads directly to Cloudinary and registers assets catalog details.
* Global Settings: Dynamic brand and analytics configuration panel.
* Dashboard UI: Modern sidebar layout, leads tables, notes drawers, file catalogs, audit trail lookups.

## Phase 3 - Client Portal & Projects
* client workspace modules.
* Document collaboration, milestone tracking, and task lists.
* Stripe billing, subscriptions, and custom agency invoices.

## Phase 4 - AI Agency Automation & SaaS Multi-tenancy
* Content generation AI agents.
* Automated newsletters and email marketing analytics.
* Multi-tenant data isolation and dynamic subdomain mappings.
