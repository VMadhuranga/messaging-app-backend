const assert = require("assert/strict");
const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const UserModel = require("../models/user-model");
const signupRouter = require("../routes/signup-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", signupRouter);

describe("POST /signup", () => {
  let mongoServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should create new user", async () => {
    const newUser = {
      first_name: "john",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd1234",
    };

    const response = await request(app).post("/signup").send(newUser);

    const user = await UserModel.findOne({ firstName: newUser.first_name })
      .lean()
      .exec();

    assert.strictEqual(response.statusCode, 201);
    assert.strictEqual(user.firstName, newUser.first_name);
  });

  it("should give error message if first name is missing", async () => {
    const newUser = {
      // first_name: "john",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd1234",
    };

    const response = await request(app).post("/signup").send(newUser);

    assert.strictEqual(response.statusCode, 400);

    const error = JSON.parse(response.error.text);
    assert.strictEqual(
      error.data.find(({ path }) => path === "first_name").msg,
      "First name is required",
    );
  });

  it("should give error message if user name already exists", async () => {
    const user1 = {
      first_name: "jane",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd1234",
    };

    const user2 = {
      first_name: "john",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd1234",
    };

    const user1Response = await request(app).post("/signup").send(user1);
    assert.strictEqual(user1Response.statusCode, 201);

    const user2Response = await request(app).post("/signup").send(user2);
    assert.strictEqual(user2Response.statusCode, 400);

    const error = JSON.parse(user2Response.error.text);
    assert.strictEqual(
      error.data.find(({ path }) => path === "username").msg,
      "User already exist",
    );
  });

  it("should give error message if password are not equal", async () => {
    const newUser = {
      first_name: "john",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd123",
    };

    const response = await request(app).post("/signup").send(newUser);

    assert.strictEqual(response.statusCode, 400);

    const error = JSON.parse(response.error.text);
    assert.strictEqual(
      error.data.find(({ path }) => path === "confirm_password").msg,
      "Passwords do not match",
    );
  });
});
