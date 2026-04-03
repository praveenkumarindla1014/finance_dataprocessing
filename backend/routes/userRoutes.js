const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { validateObjectId, validateUserUpdate } = require("../middleware/validateMiddleware");

// All user management routes require authentication + admin role
router.use(authMiddleware);
router.use(authorize("admin"));

// Admin-only user management
router.get("/", getAllUsers);
router.get("/:id", validateObjectId, getUser);
router.put("/:id", validateObjectId, validateUserUpdate, updateUser);
router.delete("/:id", validateObjectId, deleteUser);

module.exports = router;
