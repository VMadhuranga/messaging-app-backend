const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const FriendModel = require("../../models/friend-model");
const MessageModel = require("../../models/message-model");

const deleteFriend = [
  param("user_id").trim().isMongoId().escape(),
  param("friend_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await MessageModel.deleteMany({
      senderID: req.params.user_id,
      receiverID: req.params.friend_id,
    }).exec();

    await MessageModel.deleteMany({
      senderID: req.params.friend_id,
      receiverID: req.params.user_id,
    }).exec();

    await FriendModel.findOneAndDelete({
      user: req.params.user_id,
      friend: req.params.friend_id,
    }).exec();

    await FriendModel.findOneAndDelete({
      user: req.params.friend_id,
      friend: req.params.user_id,
    }).exec();

    res.json({ message: "Friend deleted successfully" });
  }),
];

module.exports = deleteFriend;
