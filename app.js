require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require("./config/dbConfig");

const userRouter = require("./routes/user-route");
const authRouter = require("./routes/auth-route");

const PORT = process.env.PORT || 3000;
const app = express();

connectDB();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRouter);
app.use("/", userRouter);

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
