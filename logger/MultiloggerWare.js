const si = require("systeminformation");
const Influx = require("influx");
const os = require("os");
const _ = require("lodash");
let data = [];

module.exports = {
  init: ({
    interval = 5000,
    database = {
      server: "127.0.0.1",
      name: "myMultilogDb",
      password: "admin",
      port: 3000
    }
  }) => {
    return init(interval, database);
  },
  log: ({ extended = false, development = false }) => {
    return log(extended, development);
  },
  error: () => {
    return throwMultilogError();
  }
};

//  Initialize the middleware, start an interval to write de buffer data to a database of choice
const init = (interval, database) => {
  const { server, name, password, port } = database;
  setInterval(() => {
    console.log("Writing to database...");
    writeToDatabase(server, name, password, port);
  }, interval);
};

//  Writes the buffer to the database
const writeToDatabase = async (server, name, password, port) => {
  const influx = new Influx.InfluxDB({
    host: server,
    database: name,
    port: port,
    schema: [
      {
        measurement: "number_of_requests",
        fields: {
          requests: Influx.FieldType.INTEGER
        },
        tags: ["requests"]
      },
      {
        measurement: "basics1",
        fields: {
          statusCode: Influx.FieldType.STRING,
          method: Influx.FieldType.STRING,
          path: Influx.FieldType.STRING,
          responseTime: Influx.FieldType.FLOAT
        },
        tags: ["statusCode", "method", "path", "responseTime"]
      },
      {
        measurement: "errors",
        fields: {
          statusCode: Influx.FieldType.STRING,
          errorMessage: Influx.FieldType.STRING,
          errorStack: Influx.FieldType.STRING,
          body: Influx.FieldType.STRING
        },
        tags: ["statusCode", "errorMessage", "errorStack", "body"]
      }
    ]
  });

  influx
    .getDatabaseNames()
    .then(names => {
      if (!names.includes("multilogDb")) {
        return influx.createDatabase("multilogDb");
      }
    })
    .catch(err => {
      console.error(`Error creating Influx database!`);
    });

  await influx
    .writePoints([
      {
        measurement: "number_of_requests",
        tags: { requests: "Requests" },
        fields: { requests: data.length }
      }
    ])
    .catch(err => {
      console.error(`Error saving data to InfluxDB! ${err.stack}`);
    });

  if (_.size(data) > 0) {
    for (const object of data) {
      await influx
        .writePoints([
          {
            measurement: "basics1",
            tags: {
              statusCode: "Status Code",
              method: "Method",
              path: "Path",
              responseTime: "Response Time in ms"
            },
            fields: {
              statusCode: object.statusCode,
              method: object.method,
              path: object.path,
              responseTime: object.responseTime
            }
          },
          {
            measurement: "errors",
            tags: {
              errorMessage: "Message",
              errorStack: "Error Stack",
              statusCode: "Status Code",
              body: "Body"
            },
            fields: {
              statusCode: object.statusCode,
              errorMessage: object.errorMessage.errorMessage,
              errorStack: object.errorMessage.errorStack,
              body: object.body
            }
          }
        ])
        .catch(err => {
          console.error(err.message);
        });
    }
  }

  data = [];
  console.log("Writing Done");
};

// Creates a log object
const log = (extended, development) => {
  return async (req, res, next) => {
    const startHrTime = process.hrtime();
    const realBody = JSON.stringify(req.body) || {};
    const cpuUsage = await getCpuInfo();
    const memoryUsage = await getMemInfo();

    res.on("finish", async () => {
      const elapsedHrTime = process.hrtime(startHrTime);
      const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
      if (extended) {
        getBasic(req, res);
        getParameters(req);
        getAuth(req);
        getPerformance(cpuUsage, memoryUsage);
      }
      const object = {
        method: req.method,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        date: new Date().toUTCString(),
        responseTime: elapsedTimeInMs,
        contentType: req.header("Content-Type"),
        hostname: req.hostname,
        url: req.url,
        path: res.statusCode !== 404 ? req.route.path : 404,
        body: req.method === "POST" ? realBody : {},
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        cookies: JSON.stringify(req.cookies),
        auth: req.header("Authorization"),
        ip: req.ip,
        clientInfo: req.header("User-Agent"),
        memoryUsage: JSON.stringify(memoryUsage),
        cpuUsage: JSON.stringify(cpuUsage),
        errorMessage: res.locals.multiError || {}
      };
      if (development) {
        console.log(object);
      }
      data.push(object);
    });
    next();
  };
};

// FANCY LOGS
const getBasic = (req, res) => {
  console.log("\n=====- Multilogger v0.1 -=====");
  console.log("--- Basic ---\n");
  console.info(
    `${req.method} ––– ${res.statusCode} –––  ${
      res.statusMessage
    } at ${new Date().toLocaleString()}`
  );
  console.info(`Response-time: ${res.getHeader("X-Response-Time")}`);
  console.info(
    `Content Type: ${req.header("Content-Type") || "No content type given"}`
  );
  console.info(`Hostname: ${req.hostname}`);
  console.info(`Path & URL: ${req.route.path} ––– ${req.url}`);
};

const getParameters = req => {
  console.log("\n--- Parameters ---\n");
  if (req.body && Object.keys(req.body).length !== 0) {
    console.info(`Request body: ${req.body}`);
  } else {
    console.info(`Request body: Body was empty`);
  }
  if (req.params && Object.keys(req.params).length !== 0) {
    console.info(`Parameters: ${JSON.stringify(req.params)}`);
  } else {
    console.info("Parameters: No parameters given");
  }
  if (req.query && Object.keys(req.query).length !== 0) {
    console.info(`Query: ${JSON.stringify(req.query)}`);
  } else {
    console.info("Query: No query given ❓");
  }
  console.info(
    `Cookies & Storage: ${JSON.stringify(req.cookies) || "No tasty cookies 🍪"}`
  );
};

const getAuth = req => {
  console.log("\n--- Authorization ---\n");
  console.info(
    `Authorization: ${req.header("Authorization") ||
      "No authorization given ⛔"}`
  );
  console.info(
    `Client: ${req.ip || "No IP found"} ––– ${req.header("User-Agent")}`
  );
};

const getPerformance = (cpuInfo, memoryInfo) => {
  console.log("\n--- Performance ---\n");

  console.info(`Memory Usage: ${JSON.stringify(memoryInfo)}`);
  console.info(`CPU Usage: ${JSON.stringify(cpuInfo)}`);
};

//  GET CPU INFO
const getCpuInfo = () => {
  return si.cpuCurrentspeed();
};

//  GET MEMORY INFO
const getMemInfo = async () => {
  const mem = await si.mem();
  return {
    free: mem.free,
    used: mem.used,
    total: mem.total
  };
};

//  THROW A CUSTOM ERROR AND ADD IT TO THE MIDDLEWARE
const throwMultilogError = () => {
  return (err, req, res, next) => {
    if (!err) {
      return next();
    }
    res.locals.multiError = {
      errorMessage: err.message,
      errorStack: err.stack
    };
    next();
  };
};
