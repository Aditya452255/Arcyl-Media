# Arcyl Media Platform - Coding Standards & Conventions

This document outlines the coding standards and architectural rules governing the Arcyl Media project.

## 1. Decoupling & Modular Architecture
We enforce a strict separation of concerns to support rapid development of CRM, Project, SaaS, and AI components.

* **Controller Layer**: Handles HTTP protocol concerns, extracts client request payloads and metadata (headers, IP, user-agent), triggers the validator, and converts outcomes into standard API responses.
* **Service Layer**: House of business rules. Agnostic of HTTP request/response interfaces. Orchestrates emails, lead matching logic, and log tracking.
* **Repository Layer**: The data gate. Interacts solely with Prisma Client to fetch and store records. Agnostic of HTTP properties.
* **Validator Layer**: Validates JSON payloads on entrance using Zod.

## 2. General Code Guidelines
* **File Length**: Individual source files should remain under **250 lines** to maintain cohesion and prevent monolithic code smells.
* **Environment Isolation**: Never access `process.env` directly. All code modules must import configuration keys from `src/config/env.js`.
* **AsyncLocalStorage Context**: Request IDs, timestamps, and log metadata are maintained globally per request using Node's native `AsyncLocalStorage` context store.
