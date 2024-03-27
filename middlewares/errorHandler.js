module.exports = (err, req, res, next) => {
  const errStatus = err.status || 500;
  const errMessage = err.message || "Something went wrong";
  const errData = err.data || null;

  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(errStatus).json({
    errMessage,
    errData,
  });
};
