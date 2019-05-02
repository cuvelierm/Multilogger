module.exports = function (err, req, res, next) {
    console.error(err.message);
    console.error(req.body);
    next(err);
};
