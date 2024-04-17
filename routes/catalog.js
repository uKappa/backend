const express = require("express");
const router = express.Router();

const website_controller = require("../controllers/websiteController");

router.get("/websites", website_controller.website_list);

router.post("/website/create", website_controller.website_create_post);

// Rota OPTIONS para a criação de website
router.options("/website/create", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
  });

module.exports = router;
