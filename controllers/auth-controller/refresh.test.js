const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

const authRouter = require("../../routes/auth-route");
const UserModel = require("../../models/user-model");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", authRouter);

describe("GET /refresh", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
    confirm_password: "jd1234",
  };

  it("should give error message if jwt cookie not present", async () => {
    const refreshResponse = await request(app).get("/refresh");

    expect(refreshResponse.statusCode).toBe(401);
    expect(refreshResponse.body.message).toBe("Unauthorized");
  });

  it("should give access token if jwt cookie present", async () => {
    const newUser = new UserModel({
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      userName: testUser.username,
      password: await bcrypt.hash(testUser.password, 10),
    });

    await newUser.save();

    const agent = request.agent(app);
    const loginResponse = await agent.post("/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    const cookie = [...loginResponse.headers["set-cookie"]];
    const refreshResponse = await agent.get("/refresh").set("Cookie", cookie);

    expect(refreshResponse.statusCode).toBe(200);
  });
});
