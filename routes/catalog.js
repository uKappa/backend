const express = require("express");
const router = express.Router();

const website_controller = require("../controllers/websiteController");

router.get("/websites", website_controller.website_list);

module.exports = router;
