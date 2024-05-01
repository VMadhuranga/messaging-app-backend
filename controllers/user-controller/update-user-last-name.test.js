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

describe("PATCH /users/:user_id/last_name", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  let userID;
  let authHeader;

  beforeEach(async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    const { id } = await newUser.save();
    userID = id;

    const loginResponse = await request(app).post("/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    authHeader = {
      field: "Authorization",
      value: `Bearer ${loginResponse.body.accessToken}`,
    };
  });

  it("should update user last name", async () => {
    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${userID}/last_name`)
      .send({ last_name: "boe" })
      .set(authHeader.field, authHeader.value);

    const updatedUser = await UserModel.findById(userID).lean().exec();

    expect(updatedUser.lastName).toBe("boe");
    expect(updateUserLastNameResponse.statusCode).toBe(200);
    expect(updateUserLastNameResponse.body.message).toBe(
      "User last name updated successfully",
    );
  });

  it("should give error message if /:user_id is wrong", async () => {
    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${userID}123/last_name`)
      .send({ last_name: "boe" })
      .set(authHeader.field, authHeader.value);

    expect(updateUserLastNameResponse.statusCode).toBe(404);
    expect(updateUserLastNameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if last name is missing", async () => {
    const updateUserLastNameResponse = await request(app)
      .patch(`/users/${userID}/last_name`)
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
