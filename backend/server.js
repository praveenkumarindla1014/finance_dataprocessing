const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const recordRoutes = require("./routes/recordRoutes");

require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
    res.send("Backend Running 🚀");
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected ✅");
    })
    .catch((err) => {
        console.log("DB Error ❌", err);
    });

// ✅ Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});