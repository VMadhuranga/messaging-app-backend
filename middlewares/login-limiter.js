const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts, please try again after a 60 second pause",
  },
  validate: { xForwardedForHeader: false },
});

module.exports = loginLimiter;
