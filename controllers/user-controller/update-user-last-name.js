const asyncHandler = require("express-async-handler");
const { body, param, validationResult } = require("express-validator");

const UserModel = require("../../models/user-model");

const updateUserLastName = [
  param("user_id").trim().isMongoId().escape(),

  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required")
    .escape(),

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

    user.lastName = req.body.last_name;

    await user.save();

    res.json({ message: "User last name updated successfully" });
  }),
];

module.exports = updateUserLastName;
