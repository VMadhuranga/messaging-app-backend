const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

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

  it("should get user sent messages", async () => {
    // add friend to user's friend list
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    // send message to friend
    await request(app)
      .post(`/users/${userID1}/friends/${userID2}/messages`)
      .send({ message: "hello" })
      .set(authHeader.field, authHeader.value);

    const getMessagesResponse = await request(app)
      .get(`/users/${userID1}/friends/${userID2}/messages`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: userID1,
      receiverID: userID2,
    })
      .lean()
      .exec();

    expect(getMessagesResponse.statusCode).toBe(200);
    expect(getMessagesResponse.body).toHaveProperty("messages");
    expect(message.content).toBe("hello");
  });

  it("should get user received messages", async () => {
    // add friend to user's friend list
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

    // add user to friend's friend list
    await request(app)
      .post(`/users/${userID2}/friends`)
      .send({
        friend_id: userID1,
      })
      .set(friendAuthHeader.field, friendAuthHeader.value);

    // send message to user
    await request(app)
      .post(`/users/${userID2}/friends/${userID1}/messages`)
      .send({
        message: "hello",
      })
      .set(friendAuthHeader.field, friendAuthHeader.value);

    const getMessagesResponse = await request(app)
      .get(`/users/${userID1}/friends/${userID2}/messages`)
      .set(authHeader.field, authHeader.value);

    const message = await MessageModel.findOne({
      senderID: userID2,
      receiverID: userID1,
    })
      .lean()
      .exec();

    expect(getMessagesResponse.statusCode).toBe(200);
    expect(getMessagesResponse.body).toHaveProperty("messages");
    expect(message.content).toBe("hello");
  });

  it("should give error message if /:user_id is wrong", async () => {
    // add friend to user's friend list
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    const getMessagesResponse = await request(app)
      .get(`/users/${userID1}123/friends/${userID2}/messages`)
      .set(authHeader.field, authHeader.value);

    expect(getMessagesResponse.statusCode).toBe(404);
    expect(getMessagesResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if /:friend_id is wrong", async () => {
    // add friend to user's friend list
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    const getMessagesResponse = await request(app)
      .get(`/users/${userID1}/friends/${userID2}123/messages`)
      .set(authHeader.field, authHeader.value);

    expect(getMessagesResponse.statusCode).toBe(404);
    expect(getMessagesResponse.body.message).toBe("Resource not found");
  });

  it("should give error response if friend not found", async () => {
    const getMessagesResponse = await request(app)
      .get(`/users/${userID1}/friends/${userID2}/messages`)
      .set(authHeader.field, authHeader.value);

    expect(getMessagesResponse.statusCode).toBe(400);
    expect(getMessagesResponse.body.message).toBe("Friend not found");
  });

  // test friend message to user
});
