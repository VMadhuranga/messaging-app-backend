const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", userRouter);

describe("PATCH /users/:user_id/last_name", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  it("should update user last name", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${id}/last_name`)
      .send({ last_name: "boe" });

    const updatedUser = await UserModel.findById(id).lean().exec();

    expect(updatedUser.lastName).toBe("boe");
    expect(updateUserLastNameResponse.statusCode).toBe(200);
    expect(updateUserLastNameResponse.body.message).toBe(
      "User last name updated successfully",
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

    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${id}123/last_name`)
      .send({ last_name: "boe" });

    expect(updateUserLastNameResponse.statusCode).toBe(404);
    expect(updateUserLastNameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if last name is missing", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${id}/last_name`)
      .send({ last_name: "" });

    const errors = updateUserLastNameResponse.body.data;

    expect(errors.find((error) => error.path === "last_name").msg).toBe(
      "Last name is required",
    );
    expect(updateUserLastNameResponse.statusCode).toBe(400);
    expect(updateUserLastNameResponse.body.message).toBe("Validation error");
  });
});
