const express = require("express");
const request = require("supertest");
const cookieParser = require("cookie-parser");

const authRouter = require("../../routes/auth-route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", authRouter);

describe("GET /logout", () => {
  it("should clear out jwt cookie", async () => {
    const loginResponse = await request(app).post("/login").send({
      username: "jd",
      password: "jd1234",
    });

    const cookie = [...loginResponse.headers["set-cookie"]];
    const logoutResponse = await request(app)
      .get("/logout")
      .set("Cookie", cookie);
    const jwtCookie = logoutResponse.headers["set-cookie"][0]
      .split(";")[0]
      .split("=")[1];

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.body.message).toBe("Cookie cleared");
    expect(jwtCookie).toBe("");
  });
});
