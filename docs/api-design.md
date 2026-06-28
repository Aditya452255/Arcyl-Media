# Arcyl Media Platform - API Specifications

This document outlines the API standards and endpoints.

## 1. Response Envelope
Every API endpoint MUST return a consistent JSON response.

### Success Response (Status 200/201)
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": "uuid-string"
  },
  "error": null
}
```

### Error Response (Status 4xx/5xx)
```json
{
  "success": false,
  "message": "Error description message",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```

## 2. API Endpoints

### POST `/api/contact`
Captures public contact form inquiries.

#### Request Headers
* `Content-Type`: `application/json`

#### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry about SEO Services",
  "message": "Hello, I would like to get a quote..."
}
```

#### Validations (Zod)
* `name`: string, min length 2, max 100.
* `email`: valid email format, mandatory.
* `phone`: optional, valid phone structure.
* `subject`: string, min length 3, max 150.
* `message`: string, min length 10, max 2000.
