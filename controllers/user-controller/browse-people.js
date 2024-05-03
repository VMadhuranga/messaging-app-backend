const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const FriendModel = require("../../models/friend-model");
const UserModel = require("../../models/user-model");

const browsePeople = [
  param("user_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const friends = await FriendModel.find(
      { userID: req.params.user_id },
      "id",
    );

    const friendsIDs = friends.map((friend) => friend._id.toString());

    const users = await UserModel.find({
      _id: { $nin: [req.params.user_id, ...friendsIDs] },
    });

    res.json({ users });
  }),
];

module.exports = browsePeople;
