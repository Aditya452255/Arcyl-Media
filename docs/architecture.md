# Arcyl Media Platform - Architectural Design

This document details the software architecture and principles implemented in the Arcyl Media project.

## 1. Directory Structure & Architectural Flow
We utilize a decoupled, layered architecture to separate concerns. This is essential for a flagship product designed to scale.

The request flow is as follows:
```
Client Request -> Next.js API Route Handler (route.js) 
               -> Centralized Error Middleware (errorHandler.js)
               -> Controller Layer (contactController.js)
               -> Validator Layer (contact.js Zod validation)
               -> Service Layer (contactService.js)
               -> Repository Layer (leadRepository.js, etc.)
               -> Prisma ORM / PostgreSQL Database
```

## 2. Layers & Responsibilities

* **API Route (src/app/api/...)**: Next.js-specific routing interface. Passes control immediately to the Centralized Error Handler and Controller.
* **Controller (src/controllers/...)**: Handles HTTP/Request details (request body extraction, user identity propagation) and forwards validated data to the services.
* **Service (src/services/...)**: Contains all business logic (email dispatching, lead matching logic, activity logging orchestration). Completely agnostic of HTTP request/response objects.
* **Repository (src/repositories/...)**: Focuses entirely on raw database access using Prisma. Agnostic of business logic and validation details.
* **Validator (src/validators/...)**: Houses Zod schemas to ensure input sanitization and typing correctness.
* **Utility (src/utils/...)**: General helper utilities like formatting logs, standardizing JSON payloads, and defining application error domains.

## 3. SOLID Principles Applied
* **Single Responsibility Principle (SRP)**: Each class/module has one reason to change. The Repository only queries; the Validator only parses; the Service orchestrates business flows.
* **Open/Closed Principle (OCP)**: Standardized response wrappers and custom error classes allow adding new features and handling new error types without modifying existing routing logic.
* **Dependency Inversion**: High-level modules do not depend directly on database logic; they rely on queries abstracted by the Repository layer.
