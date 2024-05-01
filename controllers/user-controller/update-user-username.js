const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");

const UserModel = require("../../models/user-model");

const updateUserUsername = [
  param("user_id").trim().isMongoId().escape(),

  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("User name is required")
    .escape()
    .custom(async (value, { req }) => {
      const existingUser = await UserModel.findOne({ userName: value })
        .lean()
        .exec();
      if (existingUser && req.param.user_id !== existingUser._id) {
        throw new Error("User already exist");
      }
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const paramErrors = errors
      .array()
      .filter((error) => error.location === "params");

    if (paramErrors.length > 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const bodyErrors = errors
      .array()
      .filter((error) => error.location === "body");

    if (bodyErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "Validation error", data: bodyErrors });
    }

    const user = await UserModel.findById(req.params.user_id).exec();

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.userName = req.body.username;

    await user.save();

    res.json({ message: "User username updated successfully" });
  }),
];

module.exports = updateUserUsername;
