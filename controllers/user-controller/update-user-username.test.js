const express = require("express");
const request = require("supertest");

const authRouter = require("../../routes/auth-route");
const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("PATCH /users/:user_id/username", () => {
  let user;
  let authHeader;

  beforeEach(async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "jd",
      password: "jd1234",
    });

    authHeader = {
      field: "Authorization",
      value: `Bearer ${loginResponse.body.accessToken}`,
    };

    user = await UserModel.findOne({ userName: "jd" }).lean().exec();
  });

  it("should update user user name", async () => {
    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${user._id}/username`)
      .send({ username: "jdoe" })
      .set(authHeader.field, authHeader.value);

    const updatedUser = await UserModel.findById(user._id).lean().exec();

    expect(updatedUser.userName).toBe("jdoe");
    expect(updateUserUsernameResponse.statusCode).toBe(200);
    expect(updateUserUsernameResponse.body.message).toBe(
      "User username updated successfully",
    );
  });

  it("should give error message if /:user_id is wrong", async () => {
    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${user._id}123/username`)
      .send({ username: "jdoe" })
      .set(authHeader.field, authHeader.value);

    expect(updateUserUsernameResponse.statusCode).toBe(404);
    expect(updateUserUsernameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if user name is missing", async () => {
    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${user._id}/username`)
      .send({ username: "" })
      .set(authHeader.field, authHeader.value);

    const errors = updateUserUsernameResponse.body.data;

    expect(errors.find((error) => error.path === "username").msg).toBe(
      "User name is required",
    );
    expect(updateUserUsernameResponse.statusCode).toBe(400);
    expect(updateUserUsernameResponse.body.message).toBe("Validation error");
  });

  it("should give error message if user name already exists", async () => {
    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${user._id}/username`)
      .send({ username: "se" })
      .set(authHeader.field, authHeader.value);

    const error = updateUserUsernameResponse.body.data;

    expect(updateUserUsernameResponse.statusCode).toBe(400);
    expect(error.find((error) => error.path === "username").msg).toBe(
      "User with this username already exist",
    );
  });
});
