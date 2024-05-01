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

describe("GET /users/:user_id", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  let userID;
  let authHeader;

  beforeEach(async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();
    userID = id;

    const loginResponse = await request(app).post("/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    authHeader = {
      field: "Authorization",
      value: `Bearer ${loginResponse.body.accessToken}`,
    };
  });

  it("should get user", async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userID}`)
      .set(authHeader.field, authHeader.value);

    expect(getUserResponse.statusCode).toBe(200);
    expect(getUserResponse.body).toHaveProperty("user");
  });

  it("should give error message if /:user_id is wrong", async () => {
    const getUserResponse = await request(app)
      .get(`/users/${userID}+123`)
      .set(authHeader.field, authHeader.value);

    expect(getUserResponse.statusCode).toBe(404);
    expect(getUserResponse.body.message).toBe("Resource not found");
  });
});
