const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const FriendModel = require("../../models/friend-model");
const authRouter = require("../../routes/auth-route");
const userRouter = require("../../routes/user-route");
// const friendRouter = require("../../routes/friend-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("POST /users/:user_id/friends", () => {
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

  const testUser3 = {
    first_name: "dane",
    last_name: "joe",
    username: "dj",
    password: "dj1234",
  };

  let userID1;
  let userID2;
  let userID3;
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

    const newUser3 = new UserModel({
      firstName: testUser3.first_name,
      lastName: testUser3.last_name,
      userName: testUser3.username,
      password: await bcrypt.hash(testUser3.password, 10),
    });

    const { id: id1 } = await newUser1.save();
    const { id: id2 } = await newUser2.save();
    const { id: id3 } = await newUser3.save();

    userID1 = id1;
    userID2 = id2;
    userID3 = id3;

    const loginResponse = await request(app).post("/login").send({
      username: testUser1.username,
      password: testUser1.password,
    });

    authHeader = {
      field: "Authorization",
      value: `Bearer ${loginResponse.body.accessToken}`,
    };
  });

  it("should add friend", async () => {
    const addFriendResponse = await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    const friend = await FriendModel.findOne({
      userID: userID1,
      friendID: userID2,
    })
      .lean()
      .exec();

    expect(addFriendResponse.statusCode).toBe(201);
    expect(addFriendResponse.body.message).toBe("Friend added successfully");
    expect(friend.friendID.toString()).toBe(userID2);
  });

  it("should give error message if /:user_id is wrong", async () => {
    const addFriendResponse = await request(app)
      .post(`/users/${userID1}+123/friends`)
      .send({
        friend_id: userID3,
      })
      .set(authHeader.field, authHeader.value);

    expect(addFriendResponse.statusCode).toBe(404);
    expect(addFriendResponse.body.message).toBe("Resource not found");
  });
});
