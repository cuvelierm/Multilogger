const express = require("express");
const bodyParser = require("body-parser");
const responseTime = require("response-time");
const cookieParser = require("cookie-parser");
const multilogger = require("./logger/MultiloggerWare");
const multiError = require("./logger/MultiwareError");

const indexRouter = require("./routes/index");

const app = express();
app.locals.logObjects = [];

app.use(responseTime());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(multilogger({ extended: false, development: false, interval: 5000 }));

app.use("/", indexRouter);

app.use(multiError);

// 404 Handler, No Route Defined Matched the Requested Route
// app.use((req, res) => res.sendStatus(404));

module.exports = app;
