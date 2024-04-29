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

describe("GET /logout", () => {
  const testUser = {
    first_name: "john",
    last_name: "doe",
    username: "jd",
    password: "jd1234",
  };

  it("should clear out jwt cookie", async () => {
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
    const logoutResponse = await agent.get("/logout").set("Cookie", cookie);
    const jwtCookie = logoutResponse.headers["set-cookie"][0]
      .split(";")[0]
      .split("=")[1];

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.body.message).toBe("Cookie cleared");
    expect(jwtCookie).toBe("");
  });
});
