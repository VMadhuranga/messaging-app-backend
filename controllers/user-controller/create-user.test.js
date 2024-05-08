const express = require("express");
const request = require("supertest");

const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", userRouter);

describe("POST /users", () => {
  it("should create new user", async () => {
    const newUser = {
      first_name: "john",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd1234",
    };

    const createUserResponse = await request(app).post("/users").send(newUser);
    const user = await UserModel.findOne({ firstName: newUser.first_name })
      .lean()
      .exec();

    expect(createUserResponse.statusCode).toBe(201);
    expect(user.firstName).toBe(newUser.first_name);
  });

  it("should give error message if first name is missing", async () => {
    const newUser = {
      first_name: "",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd1234",
    };

    const createUserResponse = await request(app).post("/users").send(newUser);
    const errors = createUserResponse.body.data;

    expect(createUserResponse.statusCode).toBe(400);
    expect(errors.find((error) => error.path === "first_name").msg).toBe(
      "First name is required",
    );
  });

  it("should give error message if user name already exists", async () => {
    const newUser1 = {
      first_name: "will",
      last_name: "smith",
      username: "ws",
      password: "ws1234",
      confirm_password: "ws1234",
    };

    const newUser2 = {
      first_name: "william",
      last_name: "summers",
      username: "ws",
      password: "ws1234",
      confirm_password: "ws1234",
    };

    // create new user
    await request(app).post("/users").send(newUser1);

    const user2Response = await request(app).post("/users").send(newUser2);
    const errors = user2Response.body.data;

    expect(user2Response.statusCode).toBe(400);
    expect(errors.find((error) => error.path === "username").msg).toBe(
      "User already exist",
    );
  });

  it("should give error message if passwords are not equal", async () => {
    const newUser = {
      first_name: "john",
      last_name: "doe",
      username: "jd",
      password: "jd1234",
      confirm_password: "jd123",
    };

    const createUserResponse = await request(app).post("/users").send(newUser);
    const errors = createUserResponse.body.data;

    expect(createUserResponse.statusCode).toBe(400);
    expect(errors.find((error) => error.path === "confirm_password").msg).toBe(
      "Passwords do not match",
    );
  });
});
