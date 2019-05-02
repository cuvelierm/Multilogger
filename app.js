const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const responseTime = require('response-time');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multilogger = require('./logger/MultiloggerWare');
const multiError = require('./logger/MultiwareError');

const indexRouter = require('./routes/index');

const app = express();

app.use(responseTime());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(multilogger({extended: false, development: true, interval: 5000}));
app.use(multiError);

app.use('/', indexRouter);

module.exports = app;
