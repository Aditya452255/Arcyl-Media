# Arcyl Media Platform - Database Architecture

This document covers the PostgreSQL database schema defined via Prisma ORM.

## Models

### 1. User
Represents system administrators and agency agents.
* `id`: String (UUID), Primary Key.
* `name`: String, optional.
* `email`: String, Unique index.
* `passwordHash`: String.
* `role`: Enum (ADMIN, AGENT).
* `createdAt`: DateTime.
* `updatedAt`: DateTime.

### 2. Lead
Represents clients or prospective clients captured via contact submissions or newsletters.
* `id`: String (UUID), Primary Key.
* `name`: String.
* `email`: String, Unique index.
* `phone`: String, optional.
* `company`: String, optional.
* `status`: Enum (NEW, CONTACTED, QUALIFIED, LOST). Default: `NEW`.
* `createdAt`: DateTime.
* `updatedAt`: DateTime.

### 3. ContactSubmission
Represents direct messages submitted via public forms.
* `id`: String (UUID), Primary Key.
* `leadId`: String, Foreign Key referencing `Lead.id` (cascade delete).
* `subject`: String.
* `message`: String.
* `createdAt`: DateTime.

### 4. ActivityLog
Auditing ledger for administrative actions, API interactions, and system events.
* `id`: String (UUID), Primary Key.
* `userId`: String, optional, Foreign Key referencing `User.id`.
* `action`: String (e.g., `CONTACT_FORM_SUBMISSION`, `USER_LOGIN`).
* `details`: JSON, stores parameters/audit trail.
* `ipAddress`: String, optional.
* `userAgent`: String, optional.
* `createdAt`: DateTime.
