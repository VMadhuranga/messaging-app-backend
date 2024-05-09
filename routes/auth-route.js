const express = require("express");

const authController = require("../controllers/auth-controller");
const loginLimiter = require("../middlewares/login-limiter");

const router = express.Router();

router.post("/login", loginLimiter, authController.login);
router.get("/refresh", authController.refresh);
router.get("/logout", authController.logout);

module.exports = router;
