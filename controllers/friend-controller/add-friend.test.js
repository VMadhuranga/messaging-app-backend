const express = require("express");
const request = require("supertest");

const UserModel = require("../../models/user-model");
const FriendModel = require("../../models/friend-model");
const authRouter = require("../../routes/auth-route");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("POST /users/:user_id/friends", () => {
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
    user2 = await UserModel.findOne({ userName: "bg" }).lean().exec();
  });

  it("should give error message if /:user_id is wrong", async () => {
    const addFriendResponse = await request(app)
      .post(`/users/${user._id}+123/friends`)
      .send({
        friend_id: user2._id,
      })
      .set(authHeader.field, authHeader.value);

    expect(addFriendResponse.statusCode).toBe(404);
    expect(addFriendResponse.body.message).toBe("Resource not found");
  });

  it("should add friend", async () => {
    const addFriendResponse = await request(app)
      .post(`/users/${user._id}/friends`)
      .send({
        friend_id: user2._id,
      })
      .set(authHeader.field, authHeader.value);

    const friend = await FriendModel.findOne({
      user: user._id,
      friend: user2._id,
    })
      .lean()
      .exec();

    expect(addFriendResponse.statusCode).toBe(201);
    expect(addFriendResponse.body.message).toBe("Friend added successfully");
    expect(friend.friend.toString()).toBe(user2._id.toString());
  });
});
