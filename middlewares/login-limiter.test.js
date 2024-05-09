const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/user-model");
const authRouter = require("../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);

describe("POST /login", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  beforeEach(async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    await newUser.save();
  });

  it("should give error message if rate limit exceeds", async () => {
    let loginResponse;

    // simulate rate limit
    for (let i = 0; i < 6; i++) {
      loginResponse = await request(app).post("/login").send({
        username: testUser.username,
        password: testUser.password,
      });
    }

    expect(loginResponse.statusCode).toBe(429);
    expect(loginResponse.body.message).toBe(
      "Too many login attempts, please try again after a 60 second pause",
    );
  });
});
