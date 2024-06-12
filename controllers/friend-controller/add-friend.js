const asyncHandler = require("express-async-handler");
const { param, body, validationResult } = require("express-validator");

const FriendModel = require("../../models/friend-model");

const addFriend = [
  param("user_id").trim().isMongoId().escape(),
  body("friend_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const paramErrors = errors
      .array()
      .filter((error) => error.location === "params");

    if (paramErrors.length > 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await FriendModel.create({
      user: req.params.user_id,
      friend: req.body.friend_id,
    });
    await FriendModel.create({
      user: req.body.friend_id,
      friend: req.params.user_id,
    });

    res.status(201).json({ message: "Friend added successfully" });
  }),
];

module.exports = addFriend;
