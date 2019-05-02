const os = require("os");

const multilogger = {
  multilog: (req, res, next) => {
    console.log("\n=====- Multilogger v0.1 -=====");
    const startMeasures = cpuAverage();

    res.on("finish", () => {
      getBasic(req, res);
      getParameters(req);
      getAuth(req);
      getPerformance(startMeasures);
    });

    next();
  }
};

function getBasic(req, res) {
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
  if (Object.keys(req.body).length !== 0) {
    console.info(`Request body: ${req.body}`);
  } else {
    console.info(`Request body: Body was empty`);
  }
  if (Object.keys(req.params && req.params).length !== 0) {
    console.info(`Parameters: ${JSON.stringify(req.params)}`);
  } else {
    console.info("Parameters: No parameters given");
  }
  if (Object.keys(req.query && req.query).length !== 0) {
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

function getPerformance(startMeasures) {
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
  setTimeout(() => {
    const endMeasures = cpuAverage();
    const percentageCPU = endMeasures.map((end, i) => {
      return (
        (
          (end.tick - startMeasures[i].tick) /
          (end.idle - startMeasures[i].idle) *
          100
        ).toFixed(2) + "%"
      );
    });

    console.log(`CPU Usage: ${percentageCPU.join(" ")}%`);
  }, 300);
}

// https://gist.github.com/bag-man/5570809
function cpuAverage() {
  const cpus = os.cpus();

  return cpus.map(cpu => {
    const times = cpu.times;
    return {
      tick: Object.keys(times)
        .filter(time => time !== "idle")
        .reduce((tick, time) => {
          tick += times[time];
          return tick;
        }, 0),
      idle: times.idle
    };
  });
}

module.exports = multilogger;
