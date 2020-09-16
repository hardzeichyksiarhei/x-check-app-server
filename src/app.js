const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const authRouter = require("./resources/auth/auth.router");
const taskRouter = require("./resources/tasks/task.router");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/", (req, res, next) => {
  if (req.originalUrl === "/") {
    res.send("Service is running!");
    return;
  }
  next();
});

app.use("/authenticate", authRouter);
app.use("/tasks", taskRouter);

module.exports = app;
