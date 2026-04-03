const express = require("express");
const router = express.Router();
const {
    createRecord,
    getRecords,
    getRecord,
    updateRecord,
    deleteRecord,
    restoreRecord,
} = require("../controllers/recordController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { validateRecord, validateObjectId } = require("../middleware/validateMiddleware");

// All record routes require authentication
router.use(authMiddleware);

// ─── GET routes — Viewer, Analyst, Admin can view ────────────────────
router.get("/", authorize("viewer", "analyst", "admin"), getRecords);
router.get("/:id", authorize("viewer", "analyst", "admin"), validateObjectId, getRecord);

// ─── CREATE — Analyst and Admin can create ───────────────────────────
router.post("/", authorize("analyst", "admin"), validateRecord, createRecord);

// ─── UPDATE — Analyst and Admin can update ───────────────────────────
router.put("/:id", authorize("analyst", "admin"), validateObjectId, validateRecord, updateRecord);

// ─── DELETE — Only Admin can delete ──────────────────────────────────
router.delete("/:id", authorize("admin"), validateObjectId, deleteRecord);

// ─── RESTORE — Only Admin can restore soft-deleted records ───────────
router.patch("/:id/restore", authorize("admin"), validateObjectId, restoreRecord);

module.exports = router;