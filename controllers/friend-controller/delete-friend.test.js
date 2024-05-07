const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

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
  const testUser1 = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  const testUser2 = {
    first_name: "will",
    last_name: "smith",
    username: "ws",
    password: "ws1234",
  };

  let userID1;
  let userID2;
  let authHeader;

  beforeEach(async () => {
    const newUser1 = new UserModel({
      firstName: testUser1.first_name,
      lastName: testUser1.last_name,
      userName: testUser1.username,
      password: await bcrypt.hash(testUser1.password, 10),
    });

    const newUser2 = new UserModel({
      firstName: testUser2.first_name,
      lastName: testUser2.last_name,
      userName: testUser2.username,
      password: await bcrypt.hash(testUser2.password, 10),
    });

    const { id: id1 } = await newUser1.save();
    const { id: id2 } = await newUser2.save();

    userID1 = id1;
    userID2 = id2;

    const loginResponse = await request(app).post("/login").send({
      username: testUser1.username,
      password: testUser1.password,
    });

    authHeader = {
      field: "Authorization",
      value: `Bearer ${loginResponse.body.accessToken}`,
    };
  });

  it("should delete friend", async () => {
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    const deleteFriendResponse = await request(app)
      .delete(`/users/${userID1}/friends/${userID2}`)
      .set(authHeader.field, authHeader.value);

    const friend = await FriendModel.findOne({
      userID: userID1,
      friendID: userID2,
    })
      .lean()
      .exec();

    expect(deleteFriendResponse.statusCode).toBe(200);
    expect(deleteFriendResponse.body.message).toBe(
      "Friend deleted successfully",
    );
    expect(friend).toBeFalsy();
  });

  it("should delete friend messages to user", async () => {
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    const friendLoginResponse = await request(app).post("/login").send({
      username: testUser2.username,
      password: testUser2.password,
    });

    const friendAuthHeader = {
      field: "Authorization",
      value: `Bearer ${friendLoginResponse.body.accessToken}`,
    };

    await request(app)
      .post(`/users/${userID2}/friends`)
      .send({
        friend_id: userID1,
      })
      .set(authHeader.field, authHeader.value);

    await request(app)
      .post(`/users/${userID2}/friends/${userID1}/messages`)
      .send({
        message: "hello",
      })
      .set(friendAuthHeader.field, friendAuthHeader.value);

    const deleteFriendResponse = await request(app)
      .delete(`/users/${userID1}/friends/${userID2}`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: userID2,
      receiverID: userID1,
    })
      .lean()
      .exec();

    expect(deleteFriendResponse.statusCode).toBe(200);
    expect(deleteFriendResponse.body.message).toBe(
      "Friend deleted successfully",
    );
    expect(message).toBeFalsy();
  });

  it("should delete user messages to friend", async () => {
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    await request(app)
      .post(`/users/${userID1}/friends/${userID2}/messages`)
      .send({
        message: "hello",
      })
      .set(authHeader.field, authHeader.value);

    const deleteFriendResponse = await request(app)
      .delete(`/users/${userID1}/friends/${userID2}`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: userID1,
      receiverID: userID2,
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
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    const deleteFriendResponse = await request(app)
      .delete(`/users/${userID1}123/friends/${userID2}`)
      .set(authHeader.field, authHeader.value);

    expect(deleteFriendResponse.statusCode).toBe(404);
    expect(deleteFriendResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if /:friend_id is wrong", async () => {
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    const deleteFriendResponse = await request(app)
      .delete(`/users/${userID1}/friends/${userID2}123`)
      .set(authHeader.field, authHeader.value);

    expect(deleteFriendResponse.statusCode).toBe(404);
    expect(deleteFriendResponse.body.message).toBe("Resource not found");
  });
});
