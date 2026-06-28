# Arcyl Media — Agency Operating System (AgencyOS)

Arcyl Media is a production-grade, AI-powered Digital Agency Platform built as an internal Agency Operating System. It manages the complete client-to-agency lifecycle: from leads and CMS configurations to project execution, client portal document approvals, and automated billing/invoicing.

---

## 🚀 Architectural Layout
The codebase strictly enforces the SOLID design principles using a decoupled, modular multi-tier architectural flow:

```
[HTTP Request Router] 
       │
       ▼
[errorHandler Wrapper] ──► Generates Request ID (AsyncLocalStorage context)
       │
       ▼
[auth / Role Middleware] ──► RBAC checks & tenant client security isolation
       │
       ▼
[Controller Layer] ─────► Safe parameter validation using Zod
       │
       ▼
[Service Layer] ────────► Decoupled core business logic (Resend, calculations)
       │
       ▼
[Repository Layer] ─────► Prisma queries isolated from database
       │
       ▼
[Database DS] ──────────► PostgreSQL (hosted on Neon)
```

---

## 🛠️ Feature Modules

1. **Role-Based Access Control (RBAC):** Custom `User`, `Role`, `Permission`, `UserRole`, and `RolePermission` models coordinating node-level authorization checks.
2. **Dynamic CMS Website:** 11 CMS content types (Heros, About, Services, FAQs, Portfolio, Testimonials, Team, Socials, Footer) configured dynamically from the admin panel.
3. **Operations & Employees:** Directory management, departments layout, and Activity timeline registers auditing all updates.
4. **Project Collaboration:** Project milestone roadmaps, shared directories, deliverable pipelines, and discussions calendar.
5. **Kanban Tasks Board:** Fully interactive drag-and-drop lists supporting automated project and milestone progress percentage calculations.
6. **Isolated Client Portal:** Restricted, tenant-safe dashboard where client credentials can approve deliverables, exchange files, modify profile items, and chat via project messages.
7. **Business Essentials:** Quotation converter, duplicate proposals, automatically generated invoice serials (`ARC-INV-XXXXX`), Resend email templates, and high-fidelity previews featuring browser print CSS to output pixel-perfect PDFs.

---

## 💻 Tech Stack
- **Framework:** Next.js 15 (App Router) & React 19
- **Language:** JavaScript
- **Database ORM:** Prisma Client & PostgreSQL (Neon)
- **Object Validation:** Zod
- **Mailer:** Resend
- **Media Storage:** Cloudinary
- **Logging:** Pino Structured Logger

---

## ⚙️ Local Development Setup

### 1. Configure Environment Variables
Create a `.env` file at the project root:
```env
DATABASE_URL="postgresql://user:pass@ep-host.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"

# Media Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Integration
RESEND_API_KEY="re_yourApiKey"
EMAIL_FROM="Arcyl Media <onboarding@resend.dev>"
ADMIN_EMAIL="admin@arcylmedia.com"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Sync Database Tables & Seed
```bash
# Push schema updates
npx prisma db push

# Seed roles, permissions, and metadata
npm run seed
```

### 4. Boot Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚡ Vercel Deployment

Arcyl Media compiles cleanly on Vercel. Follow these configuration guidelines:

### 1. Import Codebase
- Connect your GitHub repository to Vercel.
- Select the `Arcyl Portfolio` workspace folder as the root directory.

### 2. Build Settings
- **Build Command:** `npm run build` (or `prisma generate && next build` which is auto-configured inside `package.json`).
- **Output Directory:** Default (`.next`).

### 3. Configure Env Variables
Set all parameters in Vercel's **Environment Variables** dashboard tab matching your local `.env` settings:
- `DATABASE_URL` (Provide your production Neon PostgreSQL string)
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_EMAIL`
