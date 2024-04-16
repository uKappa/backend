var express = require('express');
var router = express.Router();
const Website = require("../models/website");
const { default: mongoose } = require("mongoose");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect("/catalog");
});

router.get("/websites", async (req, res) => {
  const result = await Website.find();
  res.send({ website_list: result });
});


module.exports = router;
