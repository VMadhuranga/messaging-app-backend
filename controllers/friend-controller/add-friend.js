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

    const newFriend = new FriendModel({
      userID: req.params.user_id,
      friendID: req.body.friend_id,
    });

    await newFriend.save();

    res.status(201).json({ message: "Friend added successfully" });
  }),
];

module.exports = addFriend;
