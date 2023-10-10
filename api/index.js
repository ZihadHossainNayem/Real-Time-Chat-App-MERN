const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");

dotenv.config();
mongoose.connect(process.env.MONGODB_URL);
jwtString = process.env.JWT_STRING;

const app = express();
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const createdUser = await User.create({ username, password });
    jwt.sign({ userId: createdUser._id }, jwtString, {}, (error, token) => {
      if (error) throw error;
      res.cookie("token", token).status(201).json({
        _id: createdUser._id,
      });
    });
  } catch (error) {
    if (error) throw error;
    res.status(500).json("error");
  }
});

app.listen(5559);