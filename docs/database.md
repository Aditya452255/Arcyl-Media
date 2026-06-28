# Arcyl Media Platform - Database Relational Schemas

This document lists database models, pipeline enums, and RBAC permissions matrices.

## 1. Pipeline Status (Enum: `LeadStatus`)
* `NEW`: Freshly captured lead.
* `QUALIFIED`: Verified and qualified.
* `PROPOSAL_SENT`: Quote or proposal submitted.
* `NEGOTIATION`: Offer review phase.
* `WON`: Won client.
* `LOST`: Lost inquiry.
* `SPAM`: Spammed submissions.

## 2. Relational Models (RBAC)

### Roles (`roles`)
* `id` (UUID, PK)
* `name` (String, Unique)
* `description` (String, Nullable)

### Permissions (`permissions`)
* `id` (UUID, PK)
* `name` (String, Unique) - e.g. `Lead.Read`
* `description` (String, Nullable)

### RolePermissions (`role_permissions`)
* `roleId` (UUID, FK, Cascade Delete)
* `permissionId` (UUID, FK, Cascade Delete)
* Primary Key: Composite (`roleId`, `permissionId`)

### UserRoles (`user_roles`)
* `userId` (UUID, FK, Cascade Delete)
* `roleId` (UUID, FK, Cascade Delete)
* Primary Key: Composite (`userId`, `roleId`)

---

## 3. CRM Models

### Leads (`leads`)
* `id` (UUID, PK)
* `name` / `email` / `phone` / `company`
* `status` (LeadStatus)
* `isArchived` (Boolean)
* `assigneeId` (UUID, FK, SetNull) - links to agent `User`

### LeadNotes (`lead_notes`)
* `id` (UUID, PK)
* `leadId` (UUID, FK, Cascade Delete)
* `authorId` (UUID, FK, Cascade Delete) - links to `User`
* `content` (Text)
* `createdAt` (DateTime)

---

## 4. Media Catalog (`media_assets`)
* `id` (UUID, PK)
* `url` (String) - secure Cloudinary asset URL
* `publicId` (String, Unique) - Cloudinary storage key
* `fileType` (String) - image, video, raw
* `mimeType` / `size` / `folder` / `altText`
* `uploadedById` (UUID, FK, SetNull) - links to `User`

---

## 5. Dynamic CMS Models

### Heros (`cms_hero`)
* `id` (UUID, PK)
* `title` / `subtitle` / `ctaText` / `ctaLink` / `backgroundImage`
* `isPublished` / `isDeleted` / `displayOrder` / `slug`
* `seoTitle` / `seoDescription` / `seoKeywords`
* `updatedById` (UUID, FK, SetNull)

### Services (`cms_services`)
* `id` / `title` / `description` / `icon` / `slug` / `displayOrder`
* `isPublished` / `isDeleted`
* `seoTitle` / `seoDescription` / `seoKeywords`
* `updatedById` (UUID, FK, SetNull)

*(Note: Other CMS tables: `cms_about`, `cms_portfolio`, `cms_testimonials`, `cms_faqs`, `cms_technologies`, `cms_team_members`, `cms_site_settings`, `cms_social_links`, `cms_footer` share this unified tracking metadata pattern).*

---

## 6. Employee Operations Models

### Employees (`employees`)
* `id` (UUID, PK)
* `userId` (UUID, FK, Unique) - linked credential account
* `departmentId` (UUID, FK, SetNull)
* `phone` / `jobTitle` / `status` (ACTIVE, INACTIVE, LEAVE)

### Departments (`departments`)
* `id` (UUID, PK)
* `name` (Unique) / `description` / `slug`

---

## 7. Client & Project Workspace Models

### Clients (`clients`)
* `id` (UUID, PK)
* `companyName` / `logo` / `industry` / `website` / `address`
* `gst` / `pan` / `timezone` / `currency` / `status` (ACTIVE, INACTIVE)

### ClientContacts (`client_contacts`)
* `id` (UUID, PK)
* `clientId` (UUID, FK)
* `firstName` / `lastName` / `email` / `phone` / `position`

### Projects (`projects`)
* `id` (UUID, PK)
* `clientId` (UUID, FK)
* `name` / `description` / `status` (PLANNING, ACTIVE, COMPLETED, ON_HOLD, CANCELLED)
* `progress` (Float) / `deadline` (DateTime)
* `managerId` (UUID, FK) - links to managing User

### Milestones (`milestones`)
* `id` (UUID, PK)
* `projectId` (UUID, FK)
* `title` / `description` / `dueDate` / `progress` / `status` (PENDING, ACTIVE, COMPLETED)

### Deliverables (`deliverables`)
* `id` (UUID, PK)
* `projectId` (UUID, FK)
* `title` / `description` / `version` / `fileUrl`
* `status` (PENDING, SUBMITTED, APPROVED, REJECTED)
* `approvalStatus` (PENDING, APPROVED, REJECTED) / `feedback` (Text)

### ProjectFiles (`project_files`)
* `id` (UUID, PK)
* `projectId` (UUID, FK)
* `mediaAssetId` (UUID, FK) - links to upload media asset catalogue
* `fileCategory` (DELIVERABLE, REQUIREMENT, CONTRACT, OTHER)
* `uploadedById` (UUID, FK)

---

## 8. Task Management & Communication Models

### Tasks (`tasks`)
* `id` (UUID, PK)
* `projectId` (UUID, FK)
* `milestoneId` (UUID, FK, SetNull)
* `title` / `description` / `status` (TODO, DOING, REVIEW, DONE)
* `priority` (LOW, MEDIUM, HIGH, URGENT)
* `assigneeId` (UUID, FK) / `dueDate` / `completedAt`

### Messages (`messages`)
* `id` (UUID, PK)
* `projectId` (UUID, FK)
* `senderId` (UUID, FK)
* `content` (Text) / `attachments` (Json) / `isRead` (Boolean)

---

## 9. Business & Finance Models

### Quotes (`quotes`)
* `id` (UUID, PK)
* `clientId` (UUID, FK)
* `services` (Json) - array of services/estimates
* `estimatedCost` (Float) / `notes` (Text) / `isConverted` (Boolean)

### Proposals (`proposals`)
* `id` (UUID, PK)
* `proposalNumber` (Unique String, e.g. `ARC-PROP-XXXXX`)
* `clientId` (UUID, FK) / `projectId` (UUID, FK, Nullable)
* `title` / `description` / `scopeOfWork` / `price` / `tax` / `discount` / `validUntil`
* `status` (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)

### Invoices (`invoices`)
* `id` (UUID, PK)
* `invoiceNumber` (Unique String, e.g. `ARC-INV-XXXXX`)
* `clientId` (UUID, FK) / `projectId` (UUID, FK, Nullable)
* `issueDate` / `dueDate` / `amount` / `tax` / `discount` / `total`
* `status` (DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED)

