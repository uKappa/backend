const express = require("express");
const router = express.Router();

const website_controller = require("../controllers/websiteController");

router.get("/websites", website_controller.website_list);

router.get("/urls", website_controller.url_list);

router.get("/reports", website_controller.reports_list);

router.post("/website/create", website_controller.website_create_post);

router.put("/website/update", website_controller.website_update);

router.get("/website/:id", website_controller.website_detail);

router.delete("/website/delete/:id", website_controller.website_delete);

router.delete("/pagina/delete/:id", website_controller.website_delete_pag);

router.put("/website/evaluate", website_controller.website_evaluate);

// Rota OPTIONS para a criação de website
router.options("/website/create", (req, res) => {
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
  
router.options("/website/evaluate", async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

module.exports = router;
