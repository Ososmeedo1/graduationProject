# API Documentation

## Overview

This frontend supports two data sources:

- `static` mode: local mock services (`src/services/static`)
- `api` mode: remote backend services (`src/services/api`)

Base URL behavior in API mode:

- Main API client: `VITE_API_BASE_URL`
- Auth API client: `VITE_AUTH_API_URL` (fallback to `VITE_API_BASE_URL`)

## Common Conventions

### Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes | `application/json` |
| `Authorization` | Protected endpoints | `Bearer <token>` |
| `Accept-Language` | Auto-injected | Current i18n language |

### Standard Error Codes

| Code | Meaning |
|---|---|
| `400` | Validation or bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not found |
| `409` | Conflict |
| `500` | Internal server error |

---

## Authentication

### 1) Verify Password

- Method: `POST`
- Route: `/api/AdminAuth/verify-password`
- Description: Validates credentials and triggers OTP step.

#### Parameters

| Name | Type | Required | In |
|---|---|---|---|
| `email` | string | Yes | body |
| `password` | string | Yes | body |

#### Request Body

```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

#### Success Response Example

```json
{
  "message": "OTP sent",
  "action": "go_to_otp_page",
  "email": "admin@example.com"
}
```

#### Error Codes

- `401` invalid credentials
- `500` server error

### 2) Verify OTP

- Method: `POST`
- Route: `/api/AdminAuth/verify-otp`
- Description: Validates OTP code and returns authentication token.

#### Parameters

| Name | Type | Required | In |
|---|---|---|---|
| `email` | string | Yes | body |
| `code` | string | Yes | body |

#### Request Body

```json
{
  "email": "admin@example.com",
  "code": "1234"
}
```

#### Success Response Example

```json
{
  "token": "jwt-token-value",
  "result": {
    "id": "1",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Error Codes

- `400` invalid OTP
- `401` unauthorized

### 3) Forgot Password

- Method: `POST`
- Route: `/api/AdminAuth/check-email`
- Description: Starts password recovery flow.

#### Parameters

| Name | Type | Required | In |
|---|---|---|---|
| `email` | string | Yes | body |

#### Request Body

```json
{
  "email": "admin@example.com"
}
```

#### Success Response Example

```json
{
  "message": "If the email exists, a reset link has been sent."
}
```

#### Error Codes

- `400` bad email format
- `404` email not found (implementation dependent)

---

## Users

### 1) List Users

- Method: `GET`
- Route: `/users`
- Description: Returns paginated users.

#### Parameters

| Name | Type | Required | In |
|---|---|---|---|
| `page` | number | No | query |
| `pageSize` | number | No | query |
| `search` | string | No | query |
| `role` | string | No | query |
| `status` | string | No | query |

#### Response Example

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Jane Doe",
      "role": "operations",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 2) Get User by ID

- Method: `GET`
- Route: `/users/:id`
- Description: Returns single user details.

### 3) Create User

- Method: `POST`
- Route: `/users`
- Description: Creates new user.

#### Request Body Example

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "finance"
}
```

### 4) Update User

- Method: `PUT`
- Route: `/users/:id`
- Description: Updates existing user.

### 5) Delete User

- Method: `DELETE`
- Route: `/users/:id`
- Description: Removes/deactivates user (backend behavior dependent).

---

## Tourists

### 1) List Tourists

- Method: `GET`
- Route: `/tourists`
- Description: Returns paginated tourist list.

#### Parameters

| Name | Type | Required | In |
|---|---|---|---|
| `page` | number | No | query |
| `pageSize` | number | No | query |
| `search` | string | No | query |
| `nationality` | string | No | query |

### 2) Get Tourist by ID

- Method: `GET`
- Route: `/tourists/:id`
- Description: Returns tourist details and optional trip history.

### 3) Create Tourist

- Method: `POST`
- Route: `/tourists`

#### Request Body Example

```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@email.com",
  "phone": "+1234567890",
  "nationality": "USA"
}
```

### 4) Update Tourist

- Method: `PUT`
- Route: `/tourists/:id`

### 5) Delete Tourist

- Method: `DELETE`
- Route: `/tourists/:id`

---

## Guides

### 1) List Guides

- Method: `GET`
- Route: `/guides`
- Description: Returns paginated guide list.

### 2) Get Guide by ID

- Method: `GET`
- Route: `/guides/:id`

### 3) Create Guide

- Method: `POST`
- Route: `/guides`

#### Request Body Example

```json
{
  "name": "Sara Mohamed",
  "email": "sara@guides.com",
  "phone": "+201098765432",
  "languages": ["Arabic", "German"],
  "hasVehicle": false
}
```

### 4) Update Guide

- Method: `PUT`
- Route: `/guides/:id`

### 5) Delete Guide

- Method: `DELETE`
- Route: `/guides/:id`

### 6) Update Guide Salary Config (contracted endpoint)

- Method: `PUT`
- Route: `/guides/:id/salary-config`
- Description: Part of backend contract for finance/admin salary configuration.

---

## Trips

### 1) List Trips

- Method: `GET`
- Route: `/trips`

### 2) Get Trip by ID

- Method: `GET`
- Route: `/trips/:id`

### 3) Create Trip

- Method: `POST`
- Route: `/trips`

### 4) Update Trip

- Method: `PUT`
- Route: `/trips/:id`

### 5) Delete Trip

- Method: `DELETE`
- Route: `/trips/:id`

### 6) Assign Guide to Trip

- Method: `POST`
- Route: `/trips/:tripId/assign-guide`

#### Parameters

| Name | Type | Required | In |
|---|---|---|---|
| `tripId` | string | Yes | path |
| `guideId` | string | Yes | body |

#### Request Body Example

```json
{
  "guideId": "guide-uuid"
}
```

### 7) Remove Guide from Trip

- Method: `DELETE`
- Route: `/trips/:tripId/assign-guide`

### 8) Add Tourist to Trip

- Method: `POST`
- Route: `/trips/:tripId/tourists`

#### Request Body Example

```json
{
  "touristId": "tourist-uuid"
}
```

### 9) Remove Tourist from Trip

- Method: `DELETE`
- Route: `/trips/:tripId/tourists/:touristId`

---

## Finance

### 1) Get Financial Stats

- Method: `GET`
- Route: `/finance/stats`
- Description: Returns financial KPI/statistics payload.

### 2) Get Salary Summary

- Method: `GET`
- Route: `/finance/salaries`

#### Parameters

| Name | Type | Required | In |
|---|---|---|---|
| `page` | number | No | query |
| `pageSize` | number | No | query |
| `guideId` | string | No | query |
| `period` | string | No | query |
| `status` | string | No | query |

#### Response Example

```json
{
  "data": [
    {
      "id": "salary-uuid",
      "period": "2026-01",
      "baseSalary": 3000,
      "tripEarnings": 2250,
      "totalAmount": 5250,
      "status": "pending"
    }
  ]
}
```

### Contracted Finance Endpoints (planned/extended backend)

- `GET /finance/dashboard`
- `GET /finance/salaries/:id`
- `PUT /finance/salaries/:id/approve`
- `PUT /finance/salaries/:id/mark-paid`

---

## Dashboard

### 1) Get Dashboard Data

- Method: `GET`
- Route: `/dashboard`
- Description: Returns dashboard cards/charts/recent activity according to role.

#### Response Example

```json
{
  "stats": {
    "revenue": { "value": "$124,500" },
    "trips": { "value": "48" },
    "tourists": { "value": "1,250" },
    "guides": { "value": "32" }
  },
  "chartData": [
    { "name": "Jan", "value": 4000 }
  ],
  "recentTrips": [],
  "topGuides": []
}
```

---

## Service Function Map (Frontend)

| Module | Function | Method | Route |
|---|---|---|---|
| Auth | `login(email, password)` | POST | `/api/AdminAuth/verify-password` |
| Auth | `verifyOtp(email, code)` | POST | `/api/AdminAuth/verify-otp` |
| Auth | `forgotPassword(email)` | POST | `/api/AdminAuth/check-email` |
| Users | `getUsers(params)` | GET | `/users` |
| Users | `getUserById(id)` | GET | `/users/:id` |
| Users | `createUser(data)` | POST | `/users` |
| Users | `updateUser(id, data)` | PUT | `/users/:id` |
| Users | `deleteUser(id)` | DELETE | `/users/:id` |
| Tourists | `getTourists(params)` | GET | `/tourists` |
| Tourists | `getTouristById(id)` | GET | `/tourists/:id` |
| Tourists | `createTourist(data)` | POST | `/tourists` |
| Tourists | `updateTourist(id, data)` | PUT | `/tourists/:id` |
| Tourists | `deleteTourist(id)` | DELETE | `/tourists/:id` |
| Guides | `getGuides(params)` | GET | `/guides` |
| Guides | `getGuideById(id)` | GET | `/guides/:id` |
| Guides | `createGuide(data)` | POST | `/guides` |
| Guides | `updateGuide(id, data)` | PUT | `/guides/:id` |
| Guides | `deleteGuide(id)` | DELETE | `/guides/:id` |
| Trips | `getTrips(params)` | GET | `/trips` |
| Trips | `getTripById(id)` | GET | `/trips/:id` |
| Trips | `createTrip(data)` | POST | `/trips` |
| Trips | `updateTrip(id, data)` | PUT | `/trips/:id` |
| Trips | `deleteTrip(id)` | DELETE | `/trips/:id` |
| Trips | `assignGuideToTrip(tripId, guide)` | POST | `/trips/:tripId/assign-guide` |
| Trips | `removeGuideFromTrip(tripId)` | DELETE | `/trips/:tripId/assign-guide` |
| Trips | `addTouristToTrip(tripId, tourist)` | POST | `/trips/:tripId/tourists` |
| Trips | `removeTouristFromTrip(tripId, touristId)` | DELETE | `/trips/:tripId/tourists/:touristId` |
| Finance | `getFinancialStats()` | GET | `/finance/stats` |
| Finance | `getSalarySummary(params)` | GET | `/finance/salaries` |
| Dashboard | `getDashboardData()` | GET | `/dashboard` |
