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

describe("PATCH /users/:user_id/first_name", () => {
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

  it("should update user first name", async () => {
    const updateUserFirstNameResponse = await request(app)
      .patch(`/users/${user._id}/first_name`)
      .send({ first_name: "jane" })
      .set(authHeader.field, authHeader.value);

    const updatedUser = await UserModel.findById(user._id).lean().exec();

    expect(updatedUser.firstName).toBe("jane");
    expect(updateUserFirstNameResponse.statusCode).toBe(200);
    expect(updateUserFirstNameResponse.body.message).toBe(
      "User first name updated successfully",
    );
  });

  it("should give error message if /:user_id is wrong", async () => {
    const updateUserFirstNameResponse = await request(app)
      .patch(`/users/${user._id}123/first_name`)
      .send({ first_name: "jane" })
      .set(authHeader.field, authHeader.value);

    expect(updateUserFirstNameResponse.statusCode).toBe(404);
    expect(updateUserFirstNameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if first name is missing", async () => {
    const updateUserFirstNameResponse = await request(app)
      .patch(`/users/${user._id}/first_name`)
      .send({ first_name: "" })
      .set(authHeader.field, authHeader.value);

    const errors = updateUserFirstNameResponse.body.data;

    expect(errors.find((error) => error.path === "first_name").msg).toBe(
      "First name is required",
    );
    expect(updateUserFirstNameResponse.statusCode).toBe(400);
    expect(updateUserFirstNameResponse.body.message).toBe("Validation error");
  });
});
