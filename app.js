const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const responseTime = require('response-time');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multilogger = require('./logger/MultiloggerWare');

const indexRouter = require('./routes/index');

const app = express();

app.use(responseTime());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(logger('dev'));
app.use(multilogger({extended: false, development: false, interval: 5000}));

app.use('/', indexRouter);

module.exports = app;
