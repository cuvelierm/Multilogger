
const multilogger = {
  multilog: (req, res, next) => {
      console.log('\n=====- Multilogger v0.1 -=====');
      console.log('--- Basic ---\n');

      res.on('finish', () => {
          console.info(`${req.method} --- ${res.statusCode} ---  ${res.statusMessage}  at ${new Date().toLocaleString()}`);
          console.info(`Response-time: ${res.getHeader('X-Response-Time')}`);
          console.info(`URL: ${req.hostname} --- ${req.url}`);
          console.info(`Client: ${req.ip} --- ${req.header('User-Agent')}`);
      });

      next();
  },
};

module.exports = multilogger;