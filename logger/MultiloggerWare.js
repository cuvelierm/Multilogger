const multilogger = {
  multilog: async (req, res, next) => {
      console.log(`Logged  ${req.url}  ${req.method} -- ${new Date()}`);
      next();
  }
};

module.exports = multilogger;