const assert = require("assert/strict");
const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const loginRouter = require("../../routes/login-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", loginRouter);

describe("POST /login", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  let mongoServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    await newUser.save();
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should log in user if correct username and password provides", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    assert.ok(loginResponse.body.accessToken);

    // get the cookie name
    const cookie = loginResponse.headers["set-cookie"][0].split("=")[0];

    assert.strictEqual(cookie, "jwt");
  });

  it("should give error message if username is incorrect", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "j",
      password: testUser.password,
    });

    const error = JSON.parse(loginResponse.error.text);

    assert.strictEqual(
      error.data.find(({ path }) => path === "username").msg,
      "Incorrect user name",
    );
  });

  it("should give error message if password is incorrect", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: testUser.username,
      password: "j",
    });

    const error = JSON.parse(loginResponse.error.text);

    assert.strictEqual(
      error.data.find(({ path }) => path === "password").msg,
      "Incorrect password",
    );
  });
});
