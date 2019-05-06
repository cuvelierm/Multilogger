const si = require("systeminformation");
let data = [];

module.exports = {
  init: ({ interval = 5000, database = {} }) => {
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
  // const { server, name, password, port } = database;
  setInterval(() => {
    writeToDatabase();
  }, interval);
};

//  Writes the buffer to the database
const writeToDatabase = () => {
  console.log(data.length || "0");
  console.log("write to database");
};

// Creates a log object
const log = (extended, development) => {
  return async (req, res, next) => {
    const startHrTime = process.hrtime();
    const realBody = req.body || {};
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
        body: req.method === "POST" ? realBody : {},
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        cookies: JSON.stringify(req.cookies),
        auth: req.header("Authorization"),
        ip: req.ip,
        clientInfo: req.header("User-Agent"),
        memoryUsage,
        cpuUsage,
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
  console.info(`Hostname & URL: ${req.hostname} ––– ${req.url}`);
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
