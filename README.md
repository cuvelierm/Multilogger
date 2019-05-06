# Multilogger

An Express middleware for better monitoring of your Node.js apps.
Parse important req, res and header objects to your database of choice. Get an easier insight of your API without any costs.

## Usage

This middleware uses a dependency on systeminformation

```
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multilogger = require("./logger/MultiloggerWare");

const indexRouter = require("./routes/index");

multilogger.init({ database: {}, interval: 10000 }); // Add this

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(multilogger.log({ development: true, extended: false })); // Also add this

app.use("/", indexRouter);

app.use(multilogger.error());

module.exports = app;
```

### Parameters

1. Extended: Logs a pretty view of req, res and headers (default false)
2. Development: If you want extra logs of the newly created object (default false)
3. Database: Soon
4. Interval: Defines the rate in ms of the interval you want to write your data to your database


## Dependencies

*   systeminformation
*   express
*   Node.js