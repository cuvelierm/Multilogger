const multilogger = {
  multilog: async (req, res, next, err) => {


      if (err) {
          console.log(err.stack);
      }

      console.log(`Logged ${req.url}  ${req.method} -- ${new Date()}`);
      next();
  },

    // basic: async (res, req, next) => {
    //
    // },
};

module.exports = multilogger;