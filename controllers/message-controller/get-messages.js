const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const MessageModel = require("../../models/message-model");
const FriendModel = require("../../models/friend-model");

const getMessages = [
  param("user_id").trim().isMongoId().escape(),
  param("friend_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const friend = await FriendModel.findOne({
      userID: req.params.user_id,
      friendID: req.params.friend_id,
    })
      .lean()
      .exec();

    if (!friend) {
      return res.status(400).json({ message: "Friend not found" });
    }

    const userMessages = await MessageModel.find({
      senderID: req.params.user_id,
      receiverID: req.params.friend_id,
    }).exec();

    const friendMessages = await MessageModel.find({
      senderID: req.params.friend_id,
      receiverID: req.params.user_id,
    }).exec();

    const messages = [...userMessages, ...friendMessages].sort(
      (a, b) => a.date.getMilliseconds() - b.date.getMilliseconds(),
    );

    res.json({ messages });
  }),
];

module.exports = getMessages;
