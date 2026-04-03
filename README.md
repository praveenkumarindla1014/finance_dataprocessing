# 📊 FinDash - Finance Data Processing and Access Control Dashboard

A full-stack, modern web application for managing financial records (income and expenses) with Role-Based Access Control (RBAC). Built using **React.js** on the frontend and **Node.js/Express.js + MongoDB** on the backend.

---

## ✨ Features

### 🔐 Authentication & Authorization

* **JWT-Based Auth**: Secure login using JSON Web Tokens.
* **Role-Based Access Control (RBAC)**: Controls what users can access.
* **Sign-up/Login**: Dynamic authentication system.

---

### 👥 User Roles

| Capability            | Viewer | Analyst | Admin |
| :-------------------- | :----: | :-----: | :---: |
| View Dashboard        |    ✅   |    ✅    |   ✅   |
| View Analytics        |    ❌   |    ✅    |   ✅   |
| Create/Update Records |    ❌   |    ✅    |   ✅   |
| Delete Records        |    ❌   |    ❌    |   ✅   |
| Manage Users          |    ❌   |    ❌    |   ✅   |

---

### 💰 Financial Records Module

* Full CRUD operations (Create, Read, Update, Delete)
* Filters (category, type, date)
* Search functionality
* Pagination support

---

### 📈 Analytics Dashboard

* Total Income, Expenses, Balance
* Monthly Trends (charts)
* Category Breakdown (pie chart)
* Recent Activity

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Recharts
* Axios

### Backend

* Node.js + Express
* MongoDB (Mongoose)
* JWT Authentication
* REST APIs

---

## 📊 Dashboard Summary APIs (Core Logic)

These APIs provide **aggregated financial insights** (not just raw data).

---

### 🔹 1. Summary API

**GET /api/dashboard/summary**

Returns:

* Total Income
* Total Expenses
* Net Balance

```json
{
  "totalIncome": 16500,
  "totalExpense": 9200,
  "balance": 7300
}
```

---

### 🔹 2. Category Breakdown

**GET /api/dashboard/category**

Groups data by category:

```json
[
  { "category": "Food", "total": 5000 },
  { "category": "Rent", "total": 8000 }
]
```

---

### 🔹 3. Monthly Trends

**GET /api/dashboard/trends**

Returns monthly data:

```json
[
  { "month": 1, "income": 5000, "expense": 3000 },
  { "month": 2, "income": 7000, "expense": 2000 }
]
```

---

### 🔹 4. Recent Activity

**GET /api/dashboard/recent**

Returns latest transactions:

```json
[
  { "amount": 5000, "type": "income" },
  { "amount": 2000, "type": "expense" }
]
```

---

### 🔐 Access Control

* Viewer → View only
* Analyst → View + Analytics
* Admin → Full access

---

### 🧠 Key Concept

These APIs use **MongoDB Aggregation** to convert raw data into meaningful insights for dashboard visualization.

---

## 🚀 Running the Project

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/financedata
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
```

Run:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Demo Credentials

| Role    | Email                                             | Password   |
| ------- | ------------------------------------------------- | ---------- |
| Admin   | [admin@findash.com](mailto:admin@findash.com)     | admin123   |
| Analyst | [analyst@findash.com](mailto:analyst@findash.com) | analyst123 |
| Viewer  | [viewer@findash.com](mailto:viewer@findash.com)   | viewer123  |

---

## 📂 Architecture

* **Backend**: Controllers, Models, Routes, Middleware
* **Auth Middleware**: Verifies JWT
* **Role Middleware**: Controls access
* **Error Middleware**: Centralized error handling

---

## 🎯 Conclusion

This project demonstrates:

* Backend architecture design
* Role-based access control
* Data aggregation using MongoDB
* Real-world dashboard API development

---

*Created by Praveen Kumar*
