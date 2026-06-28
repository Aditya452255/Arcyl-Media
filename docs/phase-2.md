# Arcyl Media Platform - Phase 2 Scope

Phase 2 transitions the application from a public lead capture platform into a secure administration interface and agency CRM.

## Scope of Work

### 1. Authentication & Security
* JWT-based login, logout, and token refresh mechanisms.
* Middleware for route protection (`src/middleware/auth.js`) supporting Role-Based Access Control (RBAC).
* Salted password hashing via bcryptjs.

### 2. CRM & Lead Management System
* Endpoint `GET /api/leads` to list and filter leads.
* Endpoint `PATCH /api/leads/:id` to update lead status (`CONTACTED`, `QUALIFIED`, `LOST`).
* Pipeline views and dashboards tracking acquisition metrics.

### 3. Media Upload Library
* Upload project mockups, client logo assets, and attachments.
* Implement Cloudinary uploads through backend helpers.
* Manage media metadata inside database models.

### 4. Activity & Audit Trail
* Full-featured activity dashboard filtering audit logs by user, action type, or date.
