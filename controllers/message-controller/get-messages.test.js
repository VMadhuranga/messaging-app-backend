const express = require("express");
const request = require("supertest");

const UserModel = require("../../models/user-model");
const MessageModel = require("../../models/message-model");
const authRouter = require("../../routes/auth-route");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("GET /users/:user_id/friends/:friend_id/messages", () => {
  let user;
  let user2;
  let authHeader;

  beforeEach(async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "jd",
      password: "jd1234",
    });

    authHeader = {
      field: "Authorization",
      value: `Bearer ${loginResponse.body.accessToken}`,
    };

    user = await UserModel.findOne({ userName: "jd" }).lean().exec();
    user2 = await UserModel.findOne({ userName: "se" }).lean().exec();
  });

  it("should get user sent messages", async () => {
    const getMessagesResponse = await request(app)
      .get(`/users/${user._id}/friends/${user2._id}/messages`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: user._id,
      receiverID: user2._id,
    })
      .lean()
      .exec();

    expect(getMessagesResponse.statusCode).toBe(200);
    expect(getMessagesResponse.body).toHaveProperty("messages");
    expect(message.content).toBe("hello");
  });

  it("should get user received messages", async () => {
    const getMessagesResponse = await request(app)
      .get(`/users/${user._id}/friends/${user2._id}/messages`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: user2._id,
      receiverID: user._id,
    })
      .lean()
      .exec();

    expect(getMessagesResponse.statusCode).toBe(200);
    expect(getMessagesResponse.body).toHaveProperty("messages");
    expect(message.content).toBe("olleh");
  });

  it("should give error message if /:user_id is wrong", async () => {
    const getMessagesResponse = await request(app)
      .get(`/users/${user._id}123/friends/${user2._id}/messages`)
      .set(authHeader.field, authHeader.value);

    expect(getMessagesResponse.statusCode).toBe(404);
    expect(getMessagesResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if /:friend_id is wrong", async () => {
    const getMessagesResponse = await request(app)
      .get(`/users/${user._id}/friends/${user2._id}123/messages`)
      .set(authHeader.field, authHeader.value);

    expect(getMessagesResponse.statusCode).toBe(404);
    expect(getMessagesResponse.body.message).toBe("Resource not found");
  });
});
