const Website = require("../models/website");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


exports.website_list = asyncHandler(async (req, res, next) => {
    const allWebsites = await Website.find()
    .sort({ id: 1 })
    .exec();

    res.json(allWebsites);
});

exports.website_create_post = asyncHandler(async (req, res, next) => {
    const website = new Website(req.body) 
    console.log(website);
    const websiteExists = await Website.findOne({ url: website.url }).exec();
    if (websiteExists) {
      // website exists, redirect to its detail page.
      res.json(website);
    } else {
      await website.save();
      // New website saved. Redirect to website detail page.
      res.json(website);
    }

  });


// Controlador para atualizar um website existente
exports.website_update = asyncHandler(async (req, res) => {
  // Extrai o ID do website do corpo da solicitação
  const websiteId = req.body._id;

  // Verifica se o website com o ID fornecido existe no banco de dados
  const website = await Website.findById(websiteId);
  console.log(website);
  if (!website) {
    return res.status(404).json({ error: "Website not found" });
  }

  // Atualiza os campos do website com base nos dados fornecidos no corpo da solicitação
  website.url = req.body.url; // Atualize o campo "url" conforme necessário

  if (!website.urls) {
    website.urls = []; // Inicializa a lista de URLs se ainda não existir
  }
  website.urls = req.body.urls; // Adiciona a nova URL à lista de URLs


  // Salva as alterações no banco de dados
  await website.save();
  console.log(website);
  // Responde com o website atualizado
  res.json(website);
});


exports.website_detail = asyncHandler(async (req, res, next) => {

  const website = await Website.findById(req.params.id).exec();

  res.json(website);

});