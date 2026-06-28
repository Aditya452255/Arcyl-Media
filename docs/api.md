# Arcyl Media Platform - API Specifications & Endpoint Schema

This document details the REST API guidelines, rate-limiting constraints, and responses.

## 1. Global JSON Format

Every request returns a consistent response body.

### Success Envelope
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null,
  "meta": {
    "requestId": "uuid-request-id",
    "timestamp": "2026-06-28T13:42:00.000Z"
  }
}
```

### Error Envelope
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": [ ... ]
  },
  "meta": {
    "requestId": "uuid-request-id",
    "timestamp": "2026-06-28T13:42:00.000Z"
  }
}
```

## 2. Security Headers & Rate Limits
Endpoints are secured with rate limit threshholds (in-memory sliding window):
* **POST `/api/contact`**: 5 requests / 10 minutes.
* **POST `/api/auth/login`**: 10 requests / minute (planned).
* **POST `/api/auth/forgot-password`**: 3 requests / hour (planned).

## 3. Swagger UI Documentation
An interactive Swagger UI API doc panel is served at `/api/docs`.
The raw OpenAPI definition JSON is served at `/api/docs/openapi.json`.
