const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", userRouter);

describe("PATCH /users/:user_id/username", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  const testUser2 = {
    first_name: "jane",
    last_name: "doe",
    username: "jdoe",
    password: "jd1234",
  };

  it("should update user user name", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${id}/username`)
      .send({ username: "jdoe" });

    const updatedUser = await UserModel.findById(id).lean().exec();

    expect(updatedUser.userName).toBe("jdoe");
    expect(updateUserUsernameResponse.statusCode).toBe(200);
    expect(updateUserUsernameResponse.body.message).toBe(
      "User username updated successfully",
    );
  });

  it("should give error message if /:user_id is wrong", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${id}123/username`)
      .send({ username: "jdoe" });

    expect(updateUserUsernameResponse.statusCode).toBe(404);
    expect(updateUserUsernameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if user name is missing", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${id}/username`)
      .send({ username: "" });

    const errors = updateUserUsernameResponse.body.data;

    expect(errors.find((error) => error.path === "username").msg).toBe(
      "User name is required",
    );
    expect(updateUserUsernameResponse.statusCode).toBe(400);
    expect(updateUserUsernameResponse.body.message).toBe("Validation error");
  });

  it("should give error message if user name already exists", async () => {
    const newUser1 = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const newUser2 = new UserModel({
      firstName: testUser2.first_name,
      lastName: testUser2.last_name,
      userName: testUser2.username,
      password: await bcrypt.hash(testUser2.password, 10),
    });

    const { id } = await newUser1.save();
    await newUser2.save();

    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${id}/username`)
      .send({ username: "jdoe" });

    const error = updateUserUsernameResponse.body.data;

    expect(updateUserUsernameResponse.statusCode).toBe(400);
    expect(error.find((error) => error.path === "username").msg).toBe(
      "User already exist",
    );
  });
});
