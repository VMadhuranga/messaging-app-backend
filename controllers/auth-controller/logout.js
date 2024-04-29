const logout = (req, res) => {
  const cookies = req.cookies;

  if (cookies?.jwt) {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Cookie cleared" });
  }

  res.sendStatus(204);
};

module.exports = logout;
