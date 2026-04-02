const express = require("express");
const router = express.Router();

const {
    createRecord,
    getRecords,
    updateRecord,
    deleteRecord
} = require("/controllers/recordController");

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// 🔐 Apply auth to all routes
router.use(authMiddleware);

// 👁 Viewer, Analyst, Admin → can view
router.get("/", authorize("viewer", "analyst", "admin"), getRecords);

// ➕ Only Admin → create
router.post("/", authorize("admin"), createRecord);

// ✏ Only Admin → update
router.put("/:id", authorize("admin"), updateRecord);

// ❌ Only Admin → delete
router.delete("/:id", authorize("admin"), deleteRecord);

router.get("/summary", authorize("analyst", "admin"), (req, res) => {
    res.json({ message: "Analytics data" });
});

module.exports = router;