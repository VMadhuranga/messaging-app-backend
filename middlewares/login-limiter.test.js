const express = require("express");
const request = require("supertest");

const authRouter = require("../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);

describe("POST /login", () => {
  it("should give error message if rate limit exceeds", async () => {
    let loginResponse;

    // simulate rate limit
    for (let i = 0; i < 6; i++) {
      loginResponse = await request(app).post("/login").send({
        username: "jd",
        password: "jd1234",
      });
    }

    expect(loginResponse.statusCode).toBe(429);
    expect(loginResponse.body.message).toBe(
      "Too many login attempts, please try again after a 60 second pause",
    );
  });
});
