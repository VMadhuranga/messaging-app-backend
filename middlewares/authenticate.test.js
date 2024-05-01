const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/user-model");
const authRouter = require("../routes/auth-route");
const userRouter = require("../routes/user-route");

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

  it("should grant access to protected routes if authenticated", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const loginResponse = await request(app).post("/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(loginResponse.statusCode).toBe(200);

    const getUserResponse = await request(app)
      .get(`/users/${id}`)
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

    expect(getUserResponse.statusCode).toBe(200);
    expect(getUserResponse.body).toHaveProperty("user");
  });
});
