const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables FIRST
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ─── Global Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ──────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// ─── Health Check ────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Finance Data Processing API is running 🚀",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            records: "/api/records",
            dashboard: "/api/dashboard",
            users: "/api/users (admin only)",
        },
    });
});

// ─── Error Handling Middleware ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Connect to DB & Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n╔════════════════════════════════════════╗`);
        console.log(`║  Server running on port ${PORT}            ║`);
        console.log(`║  Environment: ${process.env.NODE_ENV || "development"}          ║`);
        console.log(`╚════════════════════════════════════════╝\n`);
    });
});