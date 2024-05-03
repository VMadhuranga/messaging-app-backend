const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const authRouter = require("../../routes/auth-route");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("GET /users/:user_id/friends", () => {
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

  const testUser4 = {
    first_name: "adam",
    last_name: "warlock",
    username: "aw",
    password: "aw1234",
  };

  let userID1;
  let userID2;
  let userID3;
  let userID4;
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

    const newUser4 = new UserModel({
      firstName: testUser4.first_name,
      lastName: testUser4.last_name,
      userName: testUser4.username,
      password: await bcrypt.hash(testUser4.password, 10),
    });

    const { id: id1 } = await newUser1.save();
    const { id: id2 } = await newUser2.save();
    const { id: id3 } = await newUser3.save();
    const { id: id4 } = await newUser4.save();

    userID1 = id1;
    userID2 = id2;
    userID3 = id3;
    userID4 = id4;

    const loginResponse = await request(app).post("/login").send({
      username: testUser1.username,
      password: testUser1.password,
    });

    authHeader = {
      field: "Authorization",
      value: `Bearer ${loginResponse.body.accessToken}`,
    };
  });

  it("should get current user's friends", async () => {
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID2,
      })
      .set(authHeader.field, authHeader.value);

    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID3,
      })
      .set(authHeader.field, authHeader.value);

    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({
        friend_id: userID4,
      })
      .set(authHeader.field, authHeader.value);

    const getFriendsResponse = await request(app)
      .get(`/users/${userID1}/friends`)
      .set(authHeader.field, authHeader.value);

    expect(getFriendsResponse.statusCode).toBe(200);
    expect(getFriendsResponse.body).toHaveProperty("friends");
  });

  it("should get give empty array if current user doesn't have friends", async () => {
    const getFriendsResponse = await request(app)
      .get(`/users/${userID1}/friends`)
      .set(authHeader.field, authHeader.value);

    expect(getFriendsResponse.statusCode).toBe(200);
    expect(getFriendsResponse.body).toHaveProperty("friends");
    expect(getFriendsResponse.body.friends.length).toBe(0);
  });

  it("should give error message if /:user_id is wrong", async () => {
    const getFriendsResponse = await request(app)
      .get(`/users/${userID1}+123/friends`)
      .set(authHeader.field, authHeader.value);

    expect(getFriendsResponse.statusCode).toBe(404);
    expect(getFriendsResponse.body.message).toBe("Resource not found");
  });
});
