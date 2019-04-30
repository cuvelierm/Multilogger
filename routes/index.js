const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/test', function(req, res, next) {
  res.send('It works!!');
  next();
});

module.exports = router;
