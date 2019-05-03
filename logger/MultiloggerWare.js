module.exports = function({
  extended = false,
  development = false,
  database = false,
  interval = 5000
}) {
  return function(req, res, next) {
    const startTime = process.hrtime();
    const startUsage = process.cpuUsage();

    const realBody = req.body || {};

    res.on("finish", () => {
      if (extended) {
        getBasic(req, res);
        getParameters(req);
        getAuth(req);
        getPerformance(startTime, startUsage);
      } else {
        res.locals.multiLogObject = {
          method: req.method,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          date: new Date().toLocaleString(),
          responseTime: res.getHeader("X-Response-Time"),
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
          memoryUsageMb: `${(
            process.memoryUsage().heapUsed /
            1024 /
            1024
          ).toFixed(2)}`,
          memoryUsagePercentage: `${(
            process.memoryUsage().heapUsed /
            process.memoryUsage().heapTotal *
            100
          ).toFixed(2)}`,
          cpuUsage: getCpuInfo(startTime, startUsage),
          errorMessage: res.locals.multiError || {}
        };

        if (development) {
          console.log(res.locals.multiLogObject);
        }
        req.app.locals.logObjects.push(res.locals.multiLogObject);
        buffer(req.app.locals.logObjects, interval);
        next();
      }
    });
    next();
  };
};

function getBasic(req, res) {
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
}

function getParameters(req) {
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
}

function getAuth(req) {
  console.log("\n--- Authorization ---\n");
  console.info(
    `Authorization: ${req.header("Authorization") ||
      "No authorization given ⛔"}`
  );
  console.info(
    `Client: ${req.ip || "No IP found"} ––– ${req.header("User-Agent")}`
  );
}

function getCpuInfo(startTime, startUsage) {
  const elapTime = process.hrtime(startTime);
  const elapUsage = process.cpuUsage(startUsage);

  return (100 * (elapUsage.user + elapUsage.system) / elapTime[1]).toFixed(2);
}

function getPerformance(startTime, startUsage) {
  console.log("\n--- Performance ---\n");
  console.info(
    `Memory usage of Node heap: ${process.memoryUsage().heapUsed} bytes || ${(
      process.memoryUsage().heapUsed /
      1024 /
      1024
    ).toFixed(2)}MB USED out of ${process.memoryUsage().heapTotal} bytes || ${(
      process.memoryUsage().heapTotal /
      1024 /
      1024
    ).toFixed(2)}MB ––– (${(
      process.memoryUsage().heapUsed /
      process.memoryUsage().heapTotal *
      100
    ).toFixed(2)}%)`
  );
  const percentageCPU = getCpuInfo(startTime, startUsage);
  console.log(`CPU Usage: ${percentageCPU}%`);
}

function buffer(logObject, interval) {
  setInterval(() => {
    console.log(logObject.length || "0");
  }, interval);
}
