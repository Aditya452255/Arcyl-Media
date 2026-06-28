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

## Phase 3 - Agency Core & Employee Operations (Completed)
* Employee Directory: Paginated listings, search index, profile status, dynamic role assignment.
* Departments: Unified management mapping employees, roles, and project divisions.
* Activity Timelines: Operational journals logging employee movements, media actions, and platform updates.

## Phase 4 - Client & Project Workspace (Completed)
* Client Accounts: Multi-tenant client contact directory, GST/PAN credentials, and company profiles.
* Projects Lifecycle: Milestone roadmap trackers, files vaults, discussion board channels, calendar schedules.
* Deliverables Pipeline: Development version submissions, feedback tracking, and upload attachments logs.

## Phase 5 - Simple Task Management (Completed)
* Task CRUD: Kanban Board columns, status tags (Todo, Doing, Review, Done), priority indicators, soft delete.
* Progress Automation: Automatic progress calculation hooks for Milestones and Projects.
* My Tasks Widget: Logged-in user task panels grouped by Today, Overdue, This Week, and Recently Completed.

## Phase 6 & 6.5 - Client Portal & Business Essentials (Completed)
* Client Portal: Secure tenant-isolated login dashboard, read-only task views, deliverable feedback actions, message boards, and shared folders.
* Business Essentials: Quick quotations with one-click conversion, proposal duplicates, and invoices with automatic formatting (e.g. `ARC-PROP-00001` & `ARC-INV-00001`).
* Branded Document Previews: Custom document templates with Print CSS styles for browser Save-to-PDF operations.
* Chronological Timeline: Unified client timeline compiling Leads, Proposals, Projects, Deliverables, and Invoices.

