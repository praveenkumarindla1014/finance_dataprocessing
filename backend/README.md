# Finance Data Processing & Access Control Dashboard — Backend API

A complete RESTful backend system for managing financial records with role-based access control (RBAC), JWT authentication, and analytics dashboard APIs.

---

## 🏗️ Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js        # Register, Login, Profile
│   ├── recordController.js      # CRUD for financial records
│   ├── dashboardController.js   # Analytics & summary endpoints
│   └── userController.js        # Admin user management
├── middleware/
│   ├── authMiddleware.js        # JWT authentication
│   ├── roleMiddleware.js        # Role-based access control
│   ├── validateMiddleware.js    # Input validation
│   └── errorMiddleware.js       # Global error handling
├── models/
│   ├── User.js                  # User schema (name, email, password, role, status)
│   └── Record.js                # Financial record schema
├── routes/
│   ├── authRoutes.js            # /api/auth/*
│   ├── recordRoutes.js          # /api/records/*
│   ├── dashboardRoutes.js       # /api/dashboard/*
│   └── userRoutes.js            # /api/users/* (admin only)
├── .env                         # Environment variables
├── .env.example                 # Template for .env
├── package.json
├── server.js                    # App entry point
└── README.md
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/finance_dashboard` |
| `JWT_SECRET` | Secret for signing tokens | `my_super_secret_key` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |

### 3. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 👥 Roles & Permissions

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View records | ✅ | ✅ | ✅ |
| View recent transactions | ✅ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ✅ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Restore deleted records | ❌ | ❌ | ✅ |
| Access analytics/dashboard | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 📡 API Reference

### Authentication (`/api/auth`)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "analyst"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
Response includes a JWT token — use it in subsequent requests:
```
Authorization: Bearer <token>
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

### Financial Records (`/api/records`)

> All routes require `Authorization: Bearer <token>` header.

#### Create Record (Analyst, Admin)
```http
POST /api/records
Content-Type: application/json

{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "description": "Monthly salary for April"
}
```

#### Get All Records (All Roles) — with filtering & pagination
```http
GET /api/records?type=income&category=Salary&startDate=2026-01-01&endDate=2026-12-31&search=monthly&page=1&limit=10&sortBy=date&sortOrder=desc
```

Query Parameters:
| Param | Description | Example |
|---|---|---|
| `type` | Filter by income/expense | `income` |
| `category` | Filter by category (partial match) | `Salary` |
| `startDate` | Filter from date | `2026-01-01` |
| `endDate` | Filter to date | `2026-12-31` |
| `search` | Search in category & description | `monthly` |
| `page` | Page number | `1` |
| `limit` | Records per page (max 100) | `10` |
| `sortBy` | Sort field | `date`, `amount` |
| `sortOrder` | Sort direction | `asc`, `desc` |

#### Get Single Record (All Roles)
```http
GET /api/records/:id
```

#### Update Record (Analyst, Admin)
```http
PUT /api/records/:id
Content-Type: application/json

{
  "amount": 5500,
  "description": "Updated salary amount"
}
```

#### Delete Record — Soft Delete (Admin only)
```http
DELETE /api/records/:id
```

#### Restore Deleted Record (Admin only)
```http
PATCH /api/records/:id/restore
```

---

### Dashboard Analytics (`/api/dashboard`)

#### Summary — Total Income, Expenses, Net Balance (Analyst, Admin)
```http
GET /api/dashboard/summary
```
Response:
```json
{
  "success": true,
  "data": {
    "totalIncome": 25000,
    "totalExpenses": 12000,
    "netBalance": 13000,
    "totalRecords": 15
  }
}
```

#### Category-wise Totals (Analyst, Admin)
```http
GET /api/dashboard/categories?type=expense
```

#### Monthly Trends (Analyst, Admin)
```http
GET /api/dashboard/monthly-trends?year=2026
```

#### Recent Transactions (All Roles)
```http
GET /api/dashboard/recent?limit=5
```

#### Income vs Expense Comparison (Analyst, Admin)
```http
GET /api/dashboard/comparison
```

---

### User Management (`/api/users`) — Admin Only

#### Get All Users
```http
GET /api/users?role=analyst&status=active&search=john&page=1&limit=10
```

#### Get Single User
```http
GET /api/users/:id
```

#### Update User (role, status, name)
```http
PUT /api/users/:id
Content-Type: application/json

{
  "role": "analyst",
  "status": "active"
}
```

#### Delete User
```http
DELETE /api/users/:id
```

---

## 🔒 Error Responses

| Status Code | Meaning |
|---|---|
| `400` | Bad Request — validation error or invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found — resource doesn't exist |
| `500` | Internal Server Error |

Error response format:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

---

## ✨ Features

- **JWT Authentication** — Secure token-based auth with configurable expiry
- **Role-Based Access Control** — Viewer, Analyst, Admin with granular permissions
- **Input Validation** — All inputs validated before processing
- **Soft Delete** — Records are soft-deleted and can be restored
- **Pagination** — All list endpoints support pagination
- **Search** — Full-text search across category and description
- **Filtering** — Filter by date range, type, category
- **Dashboard Analytics** — Aggregated financial insights via MongoDB pipelines
- **Error Handling** — Global error middleware with proper status codes
- **Password Security** — bcrypt hashing with salt rounds
- **Account Management** — Active/inactive status, self-protection guards

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose v9
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Dev Tools:** nodemon
