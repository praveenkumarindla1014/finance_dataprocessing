# 📊 FinDash - Finance Data Processing and Access Control Dashboard

A full-stack, modern web application for managing financial records (income and expenses) with Role-Based Access Control (RBAC). Built using **React.js** on the frontend and **Node.js/Express.js + MongoDB** on the backend.

---

## ✨ Features

### 🔐 Authentication & Authorization
*   **JWT-Based Auth**: Secure logins with JSON Web Tokens properly managed via interceptors.
*   **Role-Based Access Control (RBAC)**: Fine-grained permissions dictating what users can see and do.
*   **Sign-up/Login**: Dynamic authentication form supporting quick account creation across varied roles.

### 👥 User Roles Matrix
There are three hierarchy tiers in FinDash:

| Capability | Viewer | Analyst | Admin |
|:---|:---:|:---:|:---:|
| **View Dashboard (Recent Records)** | ✅ | ✅ | ✅ |
| **View Analytics & Charts** | ❌ | ✅ | ✅ |
| **Create & Update Financial Records** | ❌ | ✅ | ✅ |
| **Fully Delete Records** | ❌ | ❌ | ✅ |
| **Manage Users (Create, Edit, Deactivate)** | ❌ | ❌ | ✅ |

### 💰 Financial Records Module
*   **Full CRUD**: Add, edit, delete, and view financial entries.
*   **Filters**: Filter by income type, predefined categories, and multi-date ranges.
*   **Search**: Dynamic text search bridging across descriptions and categories.
*   **Smart Pagination**: Limit heavy loads dynamically using page chunks.

### 📈 Beautiful Analytics Dashboard
*   **Cards Summary**: Real-time insights covering Total Income, Total Expenses, Net Balance.
*   **Visual Charts**: Built using **Recharts** for immersive insights:
    *   *Area/Bar Charts*: Visualizing monthly income & expense trends.
    *   *Donut Pie Charts*: Showcasing categorized breakdown distributions.

### 🧱 UI/UX
*   **Responsive**: Fluid grid layout supporting both mobile and desktop screens.
*   **Theming**: Local-persistent **Dark/Light Mode** toggle switch.
*   **Glassmorphism & Gradients**: Polished modern aesthetic.

---

## 🛠️ Technology Stack

**Frontend** (Located in `/frontend` folder)
*   **React 19**
*   **React Router 7** - For routing and Protected Route definitions.
*   **Recharts** - Dynamic financial analytics rendering.
*   **Axios** - Service layer featuring interceptors to manage token and redirect lifecycles.
*   **Vanilla CSS + Custom Variables** - Complete scalable Tokenized Design System for high aesthetics.

**Backend** (Located in `/backend` folder)
*   **Node.js / Express v5**
*   **MongoDB (Mongoose)** - Database storage modeling.
*   **JWT & Bcrypt** - Hashing and stateless authentication.
*   **RESTful APIs** - Modular API Controllers isolating dashboard, auth, users, and records.

---

## 🚀 Running the Project Locally

To run this application locally, you will need **Node.js** and **MongoDB** installed on your machine.

### 1. Setup Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```

Configure your `.env` variables in the `/backend` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/financedata
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

Start the backend API server:
```bash
npm run dev
```
*(The server will be running on `http://localhost:5000`)*

### 2. Setup Frontend
Open a **new** terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm start
```
*(The React application will be available at `http://localhost:3000`)*

> [!NOTE] 
> The frontend's `package.json` includes `"proxy": "http://localhost:5000"`. It automatically routes backend requests correctly and helps avoid CORS issues during active development.

---

## 🧪 Demo Login Credentials

Once your backend is running, you can create new custom accounts via the UI's **Sign Up** interface. Alternatively, you can create/test using the below identities:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@findash.com | admin123 |
| **Analyst**| analyst@findash.com | analyst123 |
| **Viewer** | viewer@findash.com | viewer123 |

*(If they do not exist inside your Database yet, simply click "Create Account" on the Login page and provision them yourself!)*

---

## 📂 Architecture Note

*   **API Structure**: The backend utilizes a scalable architecture mapping global errors through centralized `errorMiddleware`, verifying tokens with `authMiddleware`, and evaluating route safety with `roleMiddleware`.
*   **React Layer**: The App runs inside nested context hierarchies `ThemeContext -> AuthContext -> Router`, making `useTheme()` and `useAuth()` universally accessible custom hooks.

---
*Created by Praveen Kumar*
