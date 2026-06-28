# Arcyl Media Platform - Product Roadmap

This document outlines the high-level roadmap for the Arcyl Media platform.

## Phase 1: Foundation & Core Lead Capture (Current)
* Upgrade to Next.js 15 App Router & React 19.
* Configure Prisma ORM with PostgreSQL.
* Set up foundational utilities: Pino logger, standardized API responses, centralized error handling.
* Implement repository and service layer architecture.
* Integrate Zod validation for client-submitted data.
* Integrate Resend for administrative and visitor email notifications.
* Set up Cloudinary for future asset/image uploads.
* Build `/api/contact` endpoint to capture visitor inquiries.

## Phase 2: User Authentication, Agency Dashboard & CRM
* Secure user authentication using JWT and bcrypt hashing.
* Interactive administration dashboard for leads management.
* Implement complete CRM module: lead pipelines, status trackers, and contact interaction histories.
* Role-Based Access Control (RBAC): Admin, Agent, Visitor.

## Phase 3: Project Management & Client Portal
* Create client workspaces and portals.
* Document collaboration, contract signature flows, and milestone tracking.
* Invoicing and Stripe payment integration.

## Phase 4: AI Agency Engine & Modules
* Integrated AI content generation suite (blog posts, social copies).
* Automated email campaigns powered by AI client analysis.
* AI chat support agent trained on agency assets.
