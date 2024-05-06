const asyncHandler = require("express-async-handler");
const { param, body, validationResult } = require("express-validator");

const MessageModel = require("../../models/message-model");

const createMessage = [
  param("user_id").trim().isMongoId().escape(),
  param("friend_id").trim().isMongoId().escape(),

  body("message")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message is required")
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
        .json({ message: "Validation error", data: errors.array() });
    }

    const newMessage = new MessageModel({
      senderID: req.params.user_id,
      receiverID: req.params.friend_id,
      content: req.body.message,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message created successfully" });
  }),
];

module.exports = createMessage;
