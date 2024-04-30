const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", userRouter);

describe("PATCH /users/:user_id/first_name", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  it("should update user first name", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const updateUserFirstNameResponse = await request(app)
      .patch(`/users/${id}/first_name`)
      .send({ first_name: "jane" });

    const updatedUser = await UserModel.findById(id).lean().exec();

    expect(updatedUser.firstName).toBe("jane");
    expect(updateUserFirstNameResponse.statusCode).toBe(200);
    expect(updateUserFirstNameResponse.body.message).toBe(
      "User first name updated successfully",
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

    const updateUserFirstNameResponse = await request(app)
      .patch(`/users/${id}123/first_name`)
      .send({ first_name: "jane" });

    expect(updateUserFirstNameResponse.statusCode).toBe(404);
    expect(updateUserFirstNameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if first name is missing", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const updateUserFirstNameResponse = await request(app)
      .patch(`/users/${id}/first_name`)
      .send({ first_name: "" });

    const errors = updateUserFirstNameResponse.body.data;

    expect(errors.find((error) => error.path === "first_name").msg).toBe(
      "First name is required",
    );
    expect(updateUserFirstNameResponse.statusCode).toBe(400);
    expect(updateUserFirstNameResponse.body.message).toBe("Validation error");
  });
});
