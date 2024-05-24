var express = require('express');
var router = express.Router();
const Website = require("../models/website");
const Url = require("../models/url");
const Reports = require("../models/report");
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

router.get("/rules/:id", async (req, res) => {
  const result = await Rule.find();
  res.send({ rules_list: result });
});

router.get("/urls", async (req, res) => {
  const result = await Url.find();
  res.send({ url_list: result });
});

router.get("/reports", async (req, res) => {
  const result = await Reports.find();
  res.send({ report_list: result });
});

//router.get("/website/report", async (req, res) => {
//  const result = await Reports.find();
//  res.send({ report_list: result });
//});

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

router.options("/website/evaluate_website", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

router.options("/website/evaluate_url", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});


router.get("/website/:id", async (req, res, next) => {
  const result = await Website.findById(req.params.id);
  res.send({ website: result });
});

router.get("/url/:id", async (req, res, next) => {
  const result = await Url.findById(req.params.id);
  res.send({ url: result });
});

module.exports = router;
