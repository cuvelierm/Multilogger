module.exports = function(err, req, res, next) {
  if (!err) {
    return next();
  }
  res.locals.multiError = {
    errorMessage: err.message,
    errorStack: err.stack
  };
  next();
};
