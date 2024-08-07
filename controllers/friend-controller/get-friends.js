const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const FriendModel = require("../../models/friend-model");

const getFriends = [
  param("user_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const friends = await FriendModel.find(
      {
        user: req.params.user_id,
      },
      "-_id -user",
    )
      .populate("friend", "firstName lastName userName")
      .exec();

    res.json({ friends });
  }),
];

module.exports = getFriends;
