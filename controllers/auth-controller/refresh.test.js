const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const authRouter = require("../../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", authRouter);

describe("GET /refresh", () => {
  it("should give error message if jwt cookie not present", async () => {
    const refreshResponse = await request(app).get("/refresh");

    expect(refreshResponse.statusCode).toBe(401);
    expect(refreshResponse.body.message).toBe("Unauthorized");
  });

  it("should give access token if jwt cookie present", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "jd",
      password: "jd1234",
    });

    const cookie = [...loginResponse.headers["set-cookie"]];
    const refreshResponse = await request(app)
      .get("/refresh")
      .set("Cookie", cookie);

    expect(refreshResponse.statusCode).toBe(200);
  });
});
