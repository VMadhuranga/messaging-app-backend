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

describe("PATCH /users/:user_id/last_name", () => {
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

  it("should update user last name", async () => {
    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${user._id}/last_name`)
      .send({ last_name: "boe" })
      .set(authHeader.field, authHeader.value);

    const updatedUser = await UserModel.findById(user._id).lean().exec();

    expect(updatedUser.lastName).toBe("boe");
    expect(updateUserLastNameResponse.statusCode).toBe(200);
    expect(updateUserLastNameResponse.body.message).toBe(
      "User last name updated successfully",
    );
  });

  it("should give error message if /:user_id is wrong", async () => {
    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${user._id}123/last_name`)
      .send({ last_name: "boe" })
      .set(authHeader.field, authHeader.value);

    expect(updateUserLastNameResponse.statusCode).toBe(404);
    expect(updateUserLastNameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if last name is missing", async () => {
    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${user._id}/last_name`)
      .send({ last_name: "" })
      .set(authHeader.field, authHeader.value);

    const errors = updateUserLastNameResponse.body.data;

    expect(errors.find((error) => error.path === "last_name").msg).toBe(
      "Last name is required",
    );
    expect(updateUserLastNameResponse.statusCode).toBe(400);
    expect(updateUserLastNameResponse.body.message).toBe("Validation error");
  });
});
