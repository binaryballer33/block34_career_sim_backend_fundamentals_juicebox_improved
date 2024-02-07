const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { PORT = 3000 } = process.env;
const morgan = require("morgan");
require("dotenv").config();

app.use(bodyParser.json());
app.use(morgan("dev"));

// const apiRouter = require("./api");
const authRouter = require("./api/auth");
const postsRouter = require("./api/posts");
app.use("/auth", authRouter);
app.use("/posts", postsRouter);

app.listen(PORT, () => {
	console.log("The server is up on port", PORT);
});
