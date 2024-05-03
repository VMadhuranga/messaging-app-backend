const express = require("express");

const friendController = require("../controllers/friend-controller/");

const router = express.Router();

router.post("/:user_id/friends", friendController.addFriend);
router.get("/:user_id/friends", friendController.getFriends);

module.exports = router;
