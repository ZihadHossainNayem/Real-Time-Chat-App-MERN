const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
mongoose.connect(process.env.MONGODB_URL);
jwtString = process.env.JWT_STRING;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.get("/test", (req, res) => {
  res.json("test ok");
});

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

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const createdUser = await User.create({ username, password });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtString,
      {},
      (error, token) => {
        if (error) throw error;
        res.cookie("token", token).status(201).json({
          id: createdUser._id,
        });
      }
    );
  } catch (error) {
    if (error) throw error;
    res.status(500).json("error");
  }
});

app.listen(5559);
