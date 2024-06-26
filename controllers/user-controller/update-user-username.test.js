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

  it("should update user user name", async () => {
    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${userID}/username`)
      .send({ username: "jdoe" })
      .set(authHeader.field, authHeader.value);

    const updatedUser = await UserModel.findById(userID).lean().exec();

    expect(updatedUser.userName).toBe("jdoe");
    expect(updateUserUsernameResponse.statusCode).toBe(200);
    expect(updateUserUsernameResponse.body.message).toBe(
      "User username updated successfully",
    );
  });

  it("should give error message if /:user_id is wrong", async () => {
    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${userID}123/username`)
      .send({ username: "jdoe" })
      .set(authHeader.field, authHeader.value);

    expect(updateUserUsernameResponse.statusCode).toBe(404);
    expect(updateUserUsernameResponse.body.message).toBe("Resource not found");
  });

  it("should give error message if user name is missing", async () => {
    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${userID}/username`)
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
    const newUser2 = new UserModel({
      firstName: testUser2.first_name,
      lastName: testUser2.last_name,
      userName: testUser2.username,
      password: await bcrypt.hash(testUser2.password, 10),
    });

    await newUser2.save();

    const updateUserUsernameResponse = await request(app)
      .patch(`/users/${userID}/username`)
      .send({ username: "jdoe" })
      .set(authHeader.field, authHeader.value);

    const error = updateUserUsernameResponse.body.data;

    expect(updateUserUsernameResponse.statusCode).toBe(400);
    expect(error.find((error) => error.path === "username").msg).toBe(
      "User already exist",
    );
  });
});
