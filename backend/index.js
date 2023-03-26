const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();

const salt = bcrypt.genSaltSync(10);

app.use(cors());
app.use(express.json());

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
    res.json(passOk);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

app.listen(PORT, () => {
  console.log(`running on ${PORT} `);
});
