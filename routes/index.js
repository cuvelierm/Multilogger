const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.send("Got a GET request");
  next();
});

router.post("/", function(req, res, next) {
  return next(new Error("AIAIAIAI"));
  // res.send('Got a POST request')
});

router.post("/:id", function(req, res, next) {
  res.send(`Got a POST request with id ${req.params.id}`);
});

router.put("/", function(req, res, next) {
  res.send("Got a PUT request");
});

router.delete("/", function(req, res, next) {
  res.send("Got a DELETE request at");
});

module.exports = router;
