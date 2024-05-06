const express = require("express");

const messageController = require("../controllers/message-controller");

const router = express.Router();

router.post(
  "/:user_id/friends/:friend_id/messages",
  messageController.createMessage,
);
router.get(
  "/:user_id/friends/:friend_id/messages",
  messageController.getMessages,
);

module.exports = router;
