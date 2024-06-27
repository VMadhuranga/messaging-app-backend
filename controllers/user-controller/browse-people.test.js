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

describe("GET /users/:user_id/people", () => {
  let authHeader;
  let user;

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

  it("should get users without current user and user's friends", async () => {
    const browsePeopleResponse = await request(app)
      .get(`/users/${user._id}/people`)
      .set(authHeader.field, authHeader.value);

    expect(browsePeopleResponse.statusCode).toBe(200);
    expect(browsePeopleResponse.body).toHaveProperty("people");

    const people = browsePeopleResponse.body.people;
    expect(people.find((person) => person.id === user._id)).toBeFalsy();
  });

  it("should get users without current user's friends", async () => {
    const user2 = await UserModel.findOne({ userName: "bg" }).lean().exec();

    // add friend to user's friend list
    await request(app)
      .post(`/users/${user._id}/friends`)
      .send({ friend_id: user2._id })
      .set(authHeader.field, authHeader.value);

    const browsePeopleResponse = await request(app)
      .get(`/users/${user._id}/people`)
      .set(authHeader.field, authHeader.value);

    expect(browsePeopleResponse.statusCode).toBe(200);
    expect(browsePeopleResponse.body).toHaveProperty("people");

    const people = browsePeopleResponse.body.people;
    expect(
      people.every(
        (person) => person.id !== user._id && person.id !== user2._id,
      ),
    ).toBeTruthy();
  });

  it("should give error message if /:user_id is wrong", async () => {
    const browsePeopleResponse = await request(app)
      .get(`/users/${user._id}+123/people`)
      .set(authHeader.field, authHeader.value);

    expect(browsePeopleResponse.statusCode).toBe(404);
    expect(browsePeopleResponse.body.message).toBe("Resource not found");
  });
});
