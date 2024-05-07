const express = require("express");

const friendController = require("../controllers/friend-controller/");

const router = express.Router();

router.post("/:user_id/friends", friendController.addFriend);
router.get("/:user_id/friends", friendController.getFriends);
router.delete("/:user_id/friends/:friend_id", friendController.deleteFriend);

module.exports = router;
