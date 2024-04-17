var express = require('express');
var router = express.Router();
const Website = require("../models/website");
const { default: mongoose } = require("mongoose");
const cors = require('cors');
const app = express();

app.use(cors());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect("/catalog");
});

router.get("/websites", async (req, res) => {
  const result = await Website.find();
  res.send({ website_list: result });
});

router.post("/", async (req, res, next) => {
  const result = await Website.find();
  res.send({ website_list: result });
});

router.put("/", async (req, res, next) => {
  const result = await Website.find();
  res.send({ website_list: result });
});

app.options('/catalog/website/create', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

router.options("/website/update", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});


module.exports = router;
