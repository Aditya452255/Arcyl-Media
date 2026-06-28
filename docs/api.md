# Arcyl Media Platform - REST API Reference

This document catalogs the administrative endpoints, parameter matrices, and access privileges.

## 1. Authentication Endpoints

### POST `/api/auth/login`
* **Payload**: `{ "email": "...", "password": "..." }`
* **Returns**: Current User metadata. Sets HttpOnly `accessToken` (15m) and `refreshToken` (7d) cookies.

### POST `/api/auth/logout`
* **Payload**: None.
* **Returns**: Success confirmation. Instantly expires all local auth cookies.

### POST `/api/auth/refresh`
* **Payload**: None (reads `refreshToken` cookie).
* **Returns**: New User metadata and sets rotated cookies.

### GET `/api/auth/me`
* **Payload**: None (requires `accessToken`).
* **Returns**: Logged-in profile, assigned roles, and permission nodes list.

### POST `/api/auth/forgot-password`
* **Payload**: `{ "email": "..." }`
* **Returns**: Link status confirmation. Sends password-reset email via Resend if email is registered.

### POST `/api/auth/reset-password`
* **Payload**: `{ "token": "...", "newPassword": "..." }`
* **Returns**: Successful setup status.

### POST `/api/auth/change-password`
* **Payload**: `{ "oldPassword": "...", "newPassword": "..." }` (requires active session).
* **Returns**: Updated confirm status.

---

## 2. Admin Operations (Guarded by RBAC Permissions)

### GET `/api/admin/dashboard`
* **Privilege**: `Dashboard.Read`
* **Returns**: Statistics summary dashboard counters and lists.

### GET `/api/admin/analytics`
* **Privilege**: `Dashboard.Read`
* **Returns**: visitor totals, growth rate percentages, and page metrics.

---

## 3. CRM Lead Management

### GET `/api/admin/leads`
* **Privilege**: `Lead.Read`
* **Parameters**:
  * `?page=1` & `&limit=10`
  * `&search=...` (searches name/email/company/phone)
  * `&status=NEW`
  * `&sort=createdAt` & `&order=desc`
  * `&isArchived=false`
* **Returns**: Paginated leads list and `pagination` metadata block.

### GET/PATCH/DELETE `/api/admin/leads/[id]`
* **Privilege**: GET/PATCH requires `Lead.Read`/`Lead.Update`, DELETE requires `Lead.Delete`.

### POST `/api/admin/leads/[id]/notes`
* **Privilege**: `Lead.Update`
* **Payload**: `{ "content": "..." }`

### POST `/api/admin/leads/[id]/assign`
* **Privilege**: `Lead.Update`
* **Payload**: `{ "assigneeId": "..." }`

### POST `/api/admin/leads/[id]/status`
* **Privilege**: `Lead.Update`
* **Payload**: `{ "status": "QUALIFIED" }`

### POST `/api/admin/leads/[id]/archive`
* **Privilege**: `Lead.Update`
* **Payload**: `{ "isArchived": true }`

---

## 4. Media Library

### GET `/api/admin/media`
* **Privilege**: Authenticated session check.
* **Returns**: Paginated list of images and documents.

### POST `/api/admin/media`
* **Privilege**: `Media.Upload`
* **Payload**: Multipart Form-Data with key `file` (Buffer) and `folder`.

### DELETE `/api/admin/media/[id]`
* **Privilege**: `Media.Delete`

---

## 5. Dynamic CMS CRUD

### GET/POST `/api/admin/cms/[module]`
* **Privilege**: POST requires `CMS.Create`. GET allows public fetching of published drafts.
* **Modules**: `hero`, `about`, `service`, `portfolio`, `testimonial`, `faq`, `technology`, `teamMember`, `socialLink`, `siteSetting`, `footer`.

### GET/PUT/DELETE `/api/admin/cms/[module]/[id]`
* **Privilege**: PUT requires `CMS.Update`, DELETE requires `CMS.Delete`.
