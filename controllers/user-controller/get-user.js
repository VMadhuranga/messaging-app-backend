const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const UserModel = require("../../models/user-model");

const getUser = [
  param("user_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const user = await UserModel.findById(req.params.user_id).exec();

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.json({ user });
  }),
];

module.exports = getUser;
