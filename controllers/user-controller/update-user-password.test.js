const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const authRouter = require("../../routes/auth-route");
const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("PATCH /users/:user_id/password", () => {
  const newPassword = "jd1111";
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

  it("should give error message if /:user_id is wrong", async () => {
    const updateUserPasswordResponse = await request(app)
      .patch(`/users/${user._id}123/password`)
      .send({
        old_password: "jd1234",
        new_password: newPassword,
        confirm_new_password: newPassword,
      })
      .set(authHeader.field, authHeader.value);

    expect(updateUserPasswordResponse.statusCode).toBe(404);
    expect(updateUserPasswordResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if old password is missing", async () => {
    const updateUserPasswordResponse = await request(app)
      .patch(`/users/${user._id}/password`)
      .send({
        old_password: "",
        new_password: newPassword,
        confirm_new_password: newPassword,
      })
      .set(authHeader.field, authHeader.value);

    const errors = updateUserPasswordResponse.body.data;

    expect(errors.find((error) => error.path === "old_password").msg).toBe(
      "Old password is required",
    );
    expect(updateUserPasswordResponse.statusCode).toBe(400);
    expect(updateUserPasswordResponse.body.message).toBe("Validation error");
  });

  it("should give error message if old password is incorrect", async () => {
    const updateUserPasswordResponse = await request(app)
      .patch(`/users/${user._id}/password`)
      .send({
        old_password: "1234",
        new_password: newPassword,
        confirm_new_password: newPassword,
      })
      .set(authHeader.field, authHeader.value);

    const errors = updateUserPasswordResponse.body.data;

    expect(errors.find((error) => error.path === "old_password").msg).toBe(
      "Incorrect old password",
    );
    expect(updateUserPasswordResponse.statusCode).toBe(400);
    expect(updateUserPasswordResponse.body.message).toBe("Validation error");
  });

  it("should give error message if new passwords are not equal", async () => {
    const updateUserPasswordResponse = await request(app)
      .patch(`/users/${user._id}/password`)
      .send({
        old_password: "jd1234",
        new_password: newPassword,
        confirm_new_password: "1234",
      })
      .set(authHeader.field, authHeader.value);

    const errors = updateUserPasswordResponse.body.data;

    expect(
      errors.find((error) => error.path === "confirm_new_password").msg,
    ).toBe("Passwords do not match");
    expect(updateUserPasswordResponse.statusCode).toBe(400);
    expect(updateUserPasswordResponse.body.message).toBe("Validation error");
  });

  it("should update user password", async () => {
    const updateUserPasswordResponse = await request(app)
      .patch(`/users/${user._id}/password`)
      .send({
        old_password: "jd1234",
        new_password: newPassword,
        confirm_new_password: newPassword,
      })
      .set(authHeader.field, authHeader.value);

    const updatedUser = await UserModel.findById(user._id).lean().exec();
    const match = await bcrypt.compare(newPassword, updatedUser.password);

    expect(match).toBeTruthy();
    expect(updateUserPasswordResponse.statusCode).toBe(200);
    expect(updateUserPasswordResponse.body.message).toBe(
      "User password updated successfully",
    );
  });
});
