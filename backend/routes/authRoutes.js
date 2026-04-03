const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validateMiddleware");

// Public routes
router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

// Protected route
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;