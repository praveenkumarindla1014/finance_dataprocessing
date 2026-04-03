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

const path = require("path");

if (process.env.NODE_ENV === "production") {
    // Serve frontend build files
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    // Handle SPA routing by returning index.html
    app.get(/.*/, (req, res) => {
        res.sendFile(
            path.resolve(__dirname, "../frontend", "build", "index.html")
        );
    });
} else {
    // ─── Health Check for Dev ────────────────────────────────────────────
    app.get("/", (req, res) => {
        res.json({
            success: true,
            message: "Finance Data API is running (Dev Mode)",
        });
    });
}

// ─── Error Handling Middleware ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Connect to DB & Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;
const seedDemoUsers = require("./utils/seed");

connectDB().then(async () => {
    // Seed demo accounts automatically for portfolio display
    await seedDemoUsers();
    
    app.listen(PORT, () => {
        console.log(`\n╔════════════════════════════════════════╗`);
        console.log(`║  Server running on port ${PORT}            ║`);
        console.log(`║  Environment: ${process.env.NODE_ENV || "development"}          ║`);
        console.log(`╚════════════════════════════════════════╝\n`);
    });
});