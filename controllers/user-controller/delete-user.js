const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const UserModel = require("../../models/user-model");
const FriendModel = require("../../models/friend-model");
const MessageModel = require("../../models/message-model");

const deleteUser = [
  param("user_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await FriendModel.deleteMany({
      friend: req.params.user_id,
    }).exec();

    await MessageModel.deleteMany({
      senderID: req.params.user_id,
    }).exec();

    await MessageModel.deleteMany({
      receiverID: req.params.user_id,
    }).exec();

    await UserModel.findByIdAndDelete(req.params.user_id).exec();

    res.json({ message: "User deleted successfully" });
  }),
];

module.exports = deleteUser;
