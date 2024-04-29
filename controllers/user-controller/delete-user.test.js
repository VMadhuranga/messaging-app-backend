const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", userRouter);

describe("DELETE /users/:user_id", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  it("should delete user", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const deleteUserResponse = await request(app).delete(`/users/${id}`);

    expect(deleteUserResponse.statusCode).toBe(200);
    expect(deleteUserResponse.body.message).toBe("User deleted successfully");

    const user = await UserModel.findById(id).lean().exec();
    expect(user).toBe(null);
  });

  it("should give error message if /:user_id is wrong", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();

    const getUserResponse = await request(app).get(`/users/${id}+123`);

    expect(getUserResponse.statusCode).toBe(404);
    expect(getUserResponse.body.message).toBe("Resource not found");
  });
});
