const express = require("express");
const request = require("supertest");

const UserModel = require("../../models/user-model");
const userRouter = require("../../routes/user-route");
const authRouter = require("../../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("GET /users/:user_id", () => {
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

  it("should get user", async () => {
    const getUserResponse = await request(app)
      .get(`/users/${user._id}`)
      .set(authHeader.field, authHeader.value);

    expect(getUserResponse.statusCode).toBe(200);
    expect(getUserResponse.body).toHaveProperty("user");
  });

  it("should give error message if /:user_id is wrong", async () => {
    const getUserResponse = await request(app)
      .get(`/users/${user._id}+123`)
      .set(authHeader.field, authHeader.value);

    expect(getUserResponse.statusCode).toBe(404);
    expect(getUserResponse.body.message).toBe("Resource not found");
  });
});
