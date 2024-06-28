const express = require("express");
const request = require("supertest");

const authRouter = require("../../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);

describe("POST /login", () => {
  it("should log in user if username and password are correct", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "jd",
      password: "jd1234",
    });

    const cookie = loginResponse.headers["set-cookie"][0].split("=")[0];

    expect(loginResponse.body).toHaveProperty("accessToken");
    expect(cookie).toBe("jwt");
  });

  it("should give error message if username is incorrect", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "j",
      password: "jd1234",
    });

    const errors = loginResponse.body.data;

    expect(errors.find((error) => error.path === "username").msg).toBe(
      "Incorrect user name",
    );
  });

  it("should give error message if password is incorrect", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "jd",
      password: "j",
    });

    const errors = loginResponse.body.data;

    expect(errors.find((error) => error.path === "password").msg).toBe(
      "Incorrect password",
    );
  });
});
