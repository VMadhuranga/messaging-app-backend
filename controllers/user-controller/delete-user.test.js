const express = require("express");
const request = require("supertest");

const UserModel = require("../../models/user-model");
const MessageModel = require("../../models/message-model");
const FriendModel = require("../../models/friend-model");
const userRouter = require("../../routes/user-route");
const authRouter = require("../../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("DELETE /users/:user_id", () => {
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

  it("should delete user", async () => {
    const deleteUserResponse = await request(app)
      .delete(`/users/${user._id}`)
      .set(authHeader.field, authHeader.value);

    user = await UserModel.findById(user._id).lean().exec();

    expect(deleteUserResponse.statusCode).toBe(200);
    expect(deleteUserResponse.body.message).toBe("User deleted successfully");
    expect(user).toBe(null);
  });

  it("should delete user sent messages if user account deleted", async () => {
    const deleteUserResponse = await request(app)
      .delete(`/users/${user._id}`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: user._id,
      receiverID: user2._id,
    })
      .lean()
      .exec();

    expect(deleteUserResponse.statusCode).toBe(200);
    expect(deleteUserResponse.body.message).toBe("User deleted successfully");
    expect(message).toBe(null);
  });

  it("should delete user received messages if user account deleted", async () => {
    const deleteUserResponse = await request(app)
      .delete(`/users/${user._id}`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: user2._id,
      receiverID: user._id,
    })
      .lean()
      .exec();

    expect(deleteUserResponse.statusCode).toBe(200);
    expect(deleteUserResponse.body.message).toBe("User deleted successfully");
    expect(message).toBe(null);
  });

  it("should delete user's friends if user account deleted", async () => {
    const deleteUserResponse = await request(app)
      .delete(`/users/${user._id}`)
      .set(authHeader.field, authHeader.value);

    const friend = await FriendModel.findOne({
      userI: user._id,
      friend: user2._id,
    })
      .lean()
      .exec();

    expect(deleteUserResponse.statusCode).toBe(200);
    expect(deleteUserResponse.body.message).toBe("User deleted successfully");
    expect(friend).toBe(null);
  });

  it("should give error message if /:user_id is wrong", async () => {
    const deleteFriendResponse = await request(app)
      .get(`/users/${user._id}+123`)
      .set(authHeader.field, authHeader.value);

    expect(deleteFriendResponse.statusCode).toBe(404);
    expect(deleteFriendResponse.body.message).toBe("Resource not found");
  });
});
