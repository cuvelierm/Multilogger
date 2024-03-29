const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multilogger = require("./logger/MultiloggerWare");

const indexRouter = require("./routes/index");
multilogger.init({
  database: {
    server: "35.187.172.7",
    name: "multilogDb",
    port: 8086
  },
  interval: 10000
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(multilogger.log({ development: false, extended: false }));

app.use("/", indexRouter);

app.use(multilogger.error());

module.exports = app;
