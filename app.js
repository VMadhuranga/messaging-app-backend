require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { createServer } = require("http");
const { Server } = require("socket.io");
const errorHandler = require("./middlewares/errorHandler");
const connectDB = require("./config/dbConfig");
const { connectTestDB } = require("./config/testDbConfig");

const userRouter = require("./routes/user-route");
const authRouter = require("./routes/auth-route");

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: [process.env.FRONTEND_URL], credentials: true },
});

if (process.env.NODE_ENV === "development") {
  connectTestDB();
} else {
  connectDB();
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Accept", "Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["Link"],
    credentials: true,
    maxAge: 300,
  }),
);
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRouter);
app.use("/", userRouter);

app.use(errorHandler);

// socket io
io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error("invalid userId"));
  }
  socket.userId = userId;
  next();
});

const users = new Map();
io.on("connection", (socket) => {
  for (const [id, soc] of io.of("/").sockets) {
    users.set(soc.userId, id);
  }

  socket.on("message", ({ content, to }) => {
    const data = {
      content,
      _id: crypto.randomUUID(),
      senderID: socket.userId,
      date: Date(),
    };
    socket.emit("message", data);
    socket.to(users.get(to)).emit("message", data);
  });
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
