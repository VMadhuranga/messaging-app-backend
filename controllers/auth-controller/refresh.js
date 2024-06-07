const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const UserModel = require("../../models/user-model");

const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = await UserModel.findOne({ userName: decoded.username })
        .lean()
        .exec();

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const accessToken = jwt.sign(
        {
          username: user.userName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10s" },
      );

      res.json({ accessToken, userId: user._id });
    }),
  );
};

module.exports = refresh;
