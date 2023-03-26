const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

const salt = bcrypt.genSaltSync(10);

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());

// mongo connection
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("connected to DB");
});

const PORT = 4000;

// * register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

// * login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      // log in
      jwt.sign(
        { username, id: userDoc._id },
        process.env.SECRET_KEY,
        {},
        (e, token) => {
          if (e) throw e;
          res.cookie("token", token).json("ok");
        }
      );
      //   res.json()
    } else {
      res.status(400).json("wrong credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

// return profile info
app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, process.env.SECRET_KEY, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

// logout
app.post("/logout", (req, res) => {
  // set cookie to empty
  res.cookie("token", "").json("ok");
});

app.listen(PORT, () => {
  console.log(`running on ${PORT} `);
});
