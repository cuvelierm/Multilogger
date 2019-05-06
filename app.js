const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multilogger = require("./logger/MultiloggerWare");

const indexRouter = require("./routes/index");
multilogger.init({ database: {}, interval: 10000 });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(multilogger.log({ development: true, extended: false }));

app.use("/", indexRouter);

app.use(multilogger.error());

// 404 Handler, No Route Defined Matched the Requested Route
// app.use((req, res) => res.sendStatus(404));

module.exports = app;
