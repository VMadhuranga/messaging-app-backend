const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const UserModel = require("../../models/user-model");

const browsePeople = [
  param("user_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const users = await UserModel.find({ _id: { $ne: req.params.user_id } });

    res.json({ users });
  }),
];

module.exports = browsePeople;
