const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/user-model");

const signupController = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required")
    .escape(),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required")
    .escape(),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required")
    .escape()
    .custom(async (value) => {
      const existingUser = await UserModel.findOne({ userName: value })
        .lean()
        .exec();
      if (existingUser) {
        throw new Error("User already exist");
      }
    }),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password is required")
    .isAlphanumeric()
    .withMessage("Passwords must contain only letters and numbers")
    .escape(),
  body("confirm_password")
    .trim()
    .escape()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Validation error", data: errors.array() });
    }

    const newUser = new UserModel({
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      userName: req.body.username,
      password: await bcrypt.hash(req.body.username, 10),
    });

    await newUser.save();

    res.status(201).json({ message: "User signed up" });
  }),
];

module.exports = signupController;
