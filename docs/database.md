# Arcyl Media Platform - Database & Relational Schema

This document details the Prisma schema, default user roles, and database seed details.

## 1. System Roles (Enum: `Role`)
The system supports the following user role classifications:
* `SUPER_ADMIN`: Root privileges. Default user.
* `ADMIN`: Administrative dashboard manager.
* `MANAGER`: Project/Agent supervisor.
* `DEVELOPER`: Production engineer.
* `DESIGNER`: Visual asset creator.
* `SALES`: Lead qualification representative.
* `CLIENT`: External portal reviewer.

## 2. Relational Models

### Users (`users`)
Agency agents and administrators.
* `id` (UUID, PK)
* `name` (String, nullable)
* `email` (String, unique index)
* `passwordHash` (String)
* `role` (Role Enum)
* `createdAt` / `updatedAt` (DateTime)

### Leads (`leads`)
Prospective clients.
* `id` (UUID, PK)
* `name` (String)
* `email` (String, unique index)
* `phone` (String, nullable)
* `company` (String, nullable)
* `status` (LeadStatus Enum: `NEW`, `CONTACTED`, `QUALIFIED`, `LOST`)
* `createdAt` / `updatedAt` (DateTime)

### Contact Submissions (`contact_submissions`)
Form messages received from visitor inquiry pages.
* `id` (UUID, PK)
* `leadId` (UUID, FK, Cascade Delete)
* `subject` (String)
* `message` (String)
* `createdAt` (DateTime)

### Activity Logs (`activity_logs`)
System audit ledger.
* `id` (UUID, PK)
* `userId` (UUID, FK, Nullable)
* `action` (String)
* `details` (JSON)
* `ipAddress` (String, nullable)
* `userAgent` (String, nullable)
* `createdAt` (DateTime)

## 3. Database Seeding (`prisma/seed.js`)
Running `npm run seed` will execute a script that inserts a default Super Admin user (`superadmin@arcylmedia.com` with default password `SuperAdminSecurePassword2026!`) hashed using `bcryptjs`.
