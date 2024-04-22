const express = require("express");

const loginController = require("../controllers/auth-controller/login");

const router = express.Router();

router.post("/login", loginController);

module.exports = router;
