const express = require("express");

const userController = require("../controllers/user-controller/");

const router = express.Router();

router.post("/users", userController.createUser);
router.get("/users/:user_id", userController.getUser);
router.delete("/users/:user_id", userController.deleteUser);

module.exports = router;
