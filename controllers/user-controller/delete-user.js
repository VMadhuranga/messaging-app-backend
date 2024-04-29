const asyncHandler = require("express-async-handler");
const { param, validationResult } = require("express-validator");

const UserModel = require("../../models/user-model");

const deleteUser = [
  param("user_id").trim().isMongoId().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await UserModel.findByIdAndDelete(req.params.user_id).exec();

    res.json({ message: "User deleted successfully" });
  }),
];

module.exports = deleteUser;
