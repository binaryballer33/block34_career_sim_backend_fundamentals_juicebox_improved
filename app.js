const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
require("dotenv").config();

// const apiRouter = require("./api");
const authRouter = require("./api/auth");
const postsRouter = require("./api/posts");
app.use(bodyParser.json()); // needs to be before the routes, or the request body will be undefined
app.use(morgan("dev"));
app.use("/auth", authRouter);
app.use("/posts", postsRouter);

module.exports = { app };
