const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const authRouter = require("../../routes/auth-route");

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

  it("should log in user if username and password are correct", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    const cookie = loginResponse.headers["set-cookie"][0].split("=")[0];

    expect(loginResponse.body).toHaveProperty("accessToken");
    expect(cookie).toBe("jwt");
  });

  it("should give error message if username is incorrect", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "j",
      password: testUser.password,
    });

    const errors = loginResponse.body.data;

    expect(errors.find((error) => error.path === "username").msg).toBe(
      "Incorrect user name",
    );
  });

  it("should give error message if password is incorrect", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: testUser.username,
      password: "j",
    });

    const errors = loginResponse.body.data;

    expect(errors.find((error) => error.path === "password").msg).toBe(
      "Incorrect password",
    );
  });
});
