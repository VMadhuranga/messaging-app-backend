const express = require("express");
const request = require("supertest");

const UserModel = require("../models/user-model");
const authRouter = require("../routes/auth-route");
const userRouter = require("../routes/user-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/", userRouter);

describe("GET /users/:user_id", () => {
  it("should grant access to protected routes if authenticated", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "jd",
      password: "jd1234",
    });

    expect(loginResponse.statusCode).toBe(200);

    const user = await UserModel.findOne({ userName: "jd" }).lean().exec();

    const getUserResponse = await request(app)
      .get(`/users/${user._id}`)
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

    expect(getUserResponse.statusCode).toBe(200);
    expect(getUserResponse.body).toHaveProperty("user");
  });
});
