const express = require("express");

const friendController = require("../controllers/friend-controller/");

const router = express.Router();

router.post("/:user_id/friends", friendController.addFriend);

module.exports = router;
