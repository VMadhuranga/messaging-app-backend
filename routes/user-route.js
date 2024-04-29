const express = require("express");

const userController = require("../controllers/user-controller/");

const router = express.Router();

router.post("/users", userController.createUser);
router.get("/users/:user_id", userController.getUser);

module.exports = router;
