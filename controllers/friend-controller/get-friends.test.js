const express = require("express");
const request = require("supertest");

const UserModel = require("../../models/user-model");
const authRouter = require("../../routes/auth-route");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("GET /users/:user_id/friends", () => {
  let user;
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
  });

  it("should get current user's friends", async () => {
    const user2 = await UserModel.findOne({ userName: "se" }).lean().exec();
    const getFriendsResponse = await request(app)
      .get(`/users/${user._id}/friends`)
      .set(authHeader.field, authHeader.value);

    const friends = getFriendsResponse.body.friends;

    expect(getFriendsResponse.statusCode).toBe(200);
    expect(getFriendsResponse.body).toHaveProperty("friends");
    expect(friends[0].friend._id).toBe(user2._id.toString());
  });

  it("should get give empty array if current user doesn't have friends", async () => {
    const user3 = await UserModel.findOne({ userName: "bg" }).lean().exec();
    const getFriendsResponse = await request(app)
      .get(`/users/${user3._id}/friends`)
      .set(authHeader.field, authHeader.value);

    expect(getFriendsResponse.statusCode).toBe(200);
    expect(getFriendsResponse.body).toHaveProperty("friends");
    expect(getFriendsResponse.body.friends.length).toBe(0);
  });

  it("should give error message if /:user_id is wrong", async () => {
    const getFriendsResponse = await request(app)
      .get(`/users/${user.id}+123/friends`)
      .set(authHeader.field, authHeader.value);

    expect(getFriendsResponse.statusCode).toBe(404);
    expect(getFriendsResponse.body.message).toBe("Resource not found");
  });
});
