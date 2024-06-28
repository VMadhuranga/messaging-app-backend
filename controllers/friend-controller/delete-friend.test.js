const express = require("express");
const request = require("supertest");

const UserModel = require("../../models/user-model");
const FriendModel = require("../../models/friend-model");
const MessageModel = require("../../models/message-model");
const authRouter = require("../../routes/auth-route");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("DELETE /users/:user_id/friends/:friend_id", () => {
  // const testUser1 = {
  //   first_name: "john",
  //   last_name: "doe",
  //   username: "jd",
  //   password: "jd1234",
  // };

  // const testUser2 = {
  //   first_name: "will",
  //   last_name: "smith",
  //   username: "ws",
  //   password: "ws1234",
  // };

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

  it("should delete friend", async () => {
    const deleteFriendResponse = await request(app)
      .delete(`/users/${user._id}/friends/${user2._id}`)
      .set(authHeader.field, authHeader.value);

    const friend = await FriendModel.findOne({
      userID: user._id,
      friendID: user2._id,
    })
      .lean()
      .exec();

    expect(deleteFriendResponse.statusCode).toBe(200);
    expect(deleteFriendResponse.body.message).toBe(
      "Friend deleted successfully",
    );
    expect(friend).toBeFalsy();
  });

  it("should delete friend's messages to user", async () => {
    const deleteFriendResponse = await request(app)
      .delete(`/users/${user._id}/friends/${user2._id}`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: user2._id,
      receiverID: user._id,
    })
      .lean()
      .exec();

    expect(deleteFriendResponse.statusCode).toBe(200);
    expect(deleteFriendResponse.body.message).toBe(
      "Friend deleted successfully",
    );
    expect(message).toBeFalsy();
  });

  it("should delete user's messages to friend", async () => {
    const deleteFriendResponse = await request(app)
      .delete(`/users/${user._id}/friends/${user2._id}`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: user._id,
      receiverID: user2._id,
    })
      .lean()
      .exec();

    expect(deleteFriendResponse.statusCode).toBe(200);
    expect(deleteFriendResponse.body.message).toBe(
      "Friend deleted successfully",
    );
    expect(message).toBeFalsy();
  });

  it("should give error message if /:user_id is wrong", async () => {
    const deleteFriendResponse = await request(app)
      .delete(`/users/${user._id}123/friends/${user2._id}`)
      .set(authHeader.field, authHeader.value);

    expect(deleteFriendResponse.statusCode).toBe(404);
    expect(deleteFriendResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if /:friend_id is wrong", async () => {
    const deleteFriendResponse = await request(app)
      .delete(`/users/${user._id}/friends/${user2._id}123`)
      .set(authHeader.field, authHeader.value);

    expect(deleteFriendResponse.statusCode).toBe(404);
    expect(deleteFriendResponse.body.message).toBe("Resource not found");
  });
});
