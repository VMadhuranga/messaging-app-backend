const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");

const updateUserPassword = [
  param("user_id").trim().isMongoId().escape(),

  body("old_password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Old password is required")
    .escape()
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.params.user_id).lean().exec();
      const match = await bcrypt.compare(value, user.password);

      if (!match) {
        throw new Error("Incorrect old password");
      }
    }),
  body("new_password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("New password is required")
    .isAlphanumeric()
    .withMessage("Passwords must contain only letters and numbers")
    .escape(),
  body("confirm_new_password")
    .trim()
    .escape()
    .custom((value, { req }) => {
      return value === req.body.new_password;
    })
    .withMessage("Passwords do not match"),

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

    user.password = await bcrypt.hash(req.body.new_password, 10);

    await user.save();

    res.json({ message: "User password updated successfully" });
  }),
];

module.exports = updateUserPassword;
