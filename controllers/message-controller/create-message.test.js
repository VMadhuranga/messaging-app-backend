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

describe("POST /users/:user_id/friends/:friend_id/messages", () => {
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

  it("should create message", async () => {
    const createMessageResponse = await request(app)
      .post(`/users/${user._id}/friends/${user2._id}/messages`)
      .send({
        message: "hello",
      })
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: user._id,
      receiverID: user2._id,
    })
      .lean()
      .exec();

    expect(createMessageResponse.statusCode).toBe(201);
    expect(createMessageResponse.body.message).toBe(
      "Message created successfully",
    );
    expect(message.content).toBe("hello");
  });

  it("should give error message if /:user_id is wrong", async () => {
    const createMessageResponse = await request(app)
      .post(`/users/${user._id}123/friends/${user2._id}/messages`)
      .send({
        message: "hello",
      })
      .set(authHeader.field, authHeader.value);

    expect(createMessageResponse.statusCode).toBe(404);
    expect(createMessageResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if /:friend_id is wrong", async () => {
    const createMessageResponse = await request(app)
      .post(`/users/${user._id}/friends/${user2._id}123/messages`)
      .send({
        message: "hello",
      })
      .set(authHeader.field, authHeader.value);

    expect(createMessageResponse.statusCode).toBe(404);
    expect(createMessageResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if message is empty", async () => {
    const createMessageResponse = await request(app)
      .post(`/users/${user._id}/friends/${user2._id}/messages`)
      .send({
        message: "",
      })
      .set(authHeader.field, authHeader.value);

    const errors = createMessageResponse.body.data;

    expect(createMessageResponse.statusCode).toBe(400);
    expect(errors.find((error) => error.path === "message").msg).toBe(
      "Message is required",
    );
  });
});
