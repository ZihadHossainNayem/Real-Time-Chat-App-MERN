const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");

dotenv.config();
mongoose.connect(process.env.MONGODB_URL);
const jwtString = process.env.JWT_STRING;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());

/* Enable CORS (Cross-Origin Resource Sharing) middleware  */
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.get("/test", (req, res) => {
  res.json("test ok");
});

/* profile end point */
app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtString, {}, (error, userInfo) => {
      if (error) throw error;
      res.json(userInfo);
    });
  } else {
    res.status(401).json("no token");
  }
});

/* login end point */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const findUser = await User.findOne({ username });
  if (findUser) {
    const passMatched = bcrypt.compareSync(password, findUser.password);
    if (passMatched) {
      jwt.sign(
        { userId: findUser._id, username },
        jwtString,
        {},
        (error, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: findUser._id,
          });
        }
      );
    }
  }
});

/* sign up end point */
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtString,
      {},
      (error, token) => {
        if (error) throw error;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
  } catch (error) {
    if (error) throw error;
    res.status(500).json("error");
  }
});

const server = app.listen(5559);

/* web socket */
const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  /* getting connected users token from cookie */
  const cookies = req.headers.cookie;
  if (cookies) {
    const cookieTokenString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (cookieTokenString) {
      const token = cookieTokenString.split("=")[1];
      if (token) {
        /* getting userId, userName from that token */
        jwt.verify(token, jwtString, {}, (error, userData) => {
          if (error) throw error;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }
  /* online client list */
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((client) => ({
          userId: client.userId,
          username: client.username,
        })),
      })
    );
  });
});
