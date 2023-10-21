const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const Message = require("./models/Message");
const fs = require("fs");

dotenv.config();
mongoose.connect(process.env.MONGODB_URL);
const jwtString = process.env.JWT_STRING;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use("/upload", express.static(__dirname + "/upload"));
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

/* get user data from request */
const getUserDataFromRequest = async (req) => {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtString, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
};

/* end point for retrieving chat history */
app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ownUserId = userData.userId;
  const messageHistory = await Message.find({
    sender: { $in: [userId, ownUserId] },
    recipient: { $in: [userId, ownUserId] },
  }).sort({ createdAt: 1 });
  res.json(messageHistory);
});

/* end point for client list offline included */
app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
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

/* log out end point */
app.post("/logout", (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
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
  const notifyOnlineClients = () => {
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
  };
  connection.isAlive = true;

  /* ping connection every 5 seconds for profile online indication */
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyOnlineClients();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

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

  /* sending message to user */
  connection.on("message", async (message) => {
    messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    if (file) {
      const sections = file.name.split(".");
      const extension = sections[sections.length - 1];
      filename = Date.now() + "." + extension;
      const path = __dirname + "/upload/" + filename;
      /* decode file here */
      const bufferData = new Buffer(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("file saved:" + path);
      });
    }
    if (recipient && (text || file)) {
      /* message to database */
      const messageDocument = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      console.log("created message");
      /* not find, but filter, because of same user login from different device */
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              file: file ? filename : null,
              _id: messageDocument._id,
            })
          )
        );
    }
  });

  /* online client list */
  notifyOnlineClients();
});
