const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");
const authRouter = require("../../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("GET /users/:user_id/people", () => {
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
    await newUser3.save();

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

  it("should get users without current user and user's friends", async () => {
    const browsePeopleResponse = await request(app)
      .get(`/users/${userID1}/people`)
      .set(authHeader.field, authHeader.value);

    const users = browsePeopleResponse.body.users;

    expect(browsePeopleResponse.statusCode).toBe(200);
    expect(browsePeopleResponse.body).toHaveProperty("users");
    expect(users.find((user) => user.id === userID1)).toBeFalsy();
  });

  it("should get users without current user's friends", async () => {
    // add friend to user's friend list
    await request(app)
      .post(`/users/${userID1}/friends`)
      .send({ friend_id: userID2 })
      .set(authHeader.field, authHeader.value);

    const browsePeopleResponse = await request(app)
      .get(`/users/${userID1}/people`)
      .set(authHeader.field, authHeader.value);

    const users = browsePeopleResponse.body.users;

    expect(browsePeopleResponse.statusCode).toBe(200);
    expect(browsePeopleResponse.body).toHaveProperty("users");
    expect(
      users.every((user) => user.id !== userID1 && user.id !== userID2),
    ).toBeTruthy();
  });

  it("should give error message if /:user_id is wrong", async () => {
    const browsePeopleResponse = await request(app)
      .get(`/users/${userID1}+123/people`)
      .set(authHeader.field, authHeader.value);

    expect(browsePeopleResponse.statusCode).toBe(404);
    expect(browsePeopleResponse.body.message).toBe("Resource not found");
  });
});
