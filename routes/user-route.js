const express = require("express");

const userController = require("../controllers/user-controller/");
const friendRouter = require("./friend-route");
const messageRouter = require("./message-route");
const authenticate = require("../middlewares/authenticate");

const router = express.Router();

router.post("/users", userController.createUser);
router.use(authenticate);
router.get("/users/:user_id", userController.getUser);
router.delete("/users/:user_id", userController.deleteUser);
router.patch("/users/:user_id/first_name", userController.updateUserFirstName);
router.patch("/users/:user_id/last_name", userController.updateUserLastName);
router.patch("/users/:user_id/username", userController.updateUserUsername);
router.get("/users/:user_id/people", userController.browsePeople);
router.use("/users", friendRouter);
router.use("/users", messageRouter);

module.exports = router;
