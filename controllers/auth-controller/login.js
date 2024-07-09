require("dotenv").config();
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../../models/user-model");

const login = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username is required")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password is required")
    .isAlphanumeric()
    .withMessage("Password must contain only letters and numbers")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ message: "Validation error", data: errors.array() });
    }

    const user = await UserModel.findOne({
      userName: req.body.username,
    })
      .lean()
      .exec();

    if (!user) {
      await body("username")
        .custom(() => {
          throw new Error("Incorrect user name");
        })
        .run(req);

      return res
        .status(401)
        .json({ message: "Unauthorized", data: validationResult(req).array() });
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      await body("password")
        .custom(() => {
          throw new Error("Incorrect password");
        })
        .run(req);

      return res
        .status(401)
        .json({ message: "Unauthorized", data: validationResult(req).array() });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10s",
      },
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, userId: user._id });
  }),
];

module.exports = login;
