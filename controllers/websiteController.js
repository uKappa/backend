const Website = require("../models/website");
const Url = require("../models/url");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const QualWeb = require('qualweb');


exports.website_list = asyncHandler(async (req, res, next) => {
    const allWebsites = await Website.find().populate('url').populate('urls')
    .sort({ data_registo: 1 })
    .exec();

    res.json(allWebsites);
});

exports.url_list = asyncHandler(async (req, res, next) => {
  const allUrls = await Url.find()
  .sort({ link: 1 })
  .exec();

  res.json(allUrls);
});

exports.website_create_post = asyncHandler(async (req, res, next) => {
    const { link, estado, ultima_aval } = req.body;
    console.log(link);
    const urlExists = await Url.findOne({ link }).exec();
    if (urlExists) {
      // URL já existe, você pode decidir o que fazer aqui, talvez retornar um erro
      res.status(400).json({ message: "A URL já existe." });
    } else {
      // Crie um novo objeto Url
      const newUrl = new Url({ link, estado, ultima_aval });
      await newUrl.save();

      // Crie um novo objeto Website com a referência para o novo objeto Url
      const newWebsite = new Website({
      url: newUrl._id, // Referência para o novo objeto Url
      estado: "PorAvaliar", // ou o estado padrão desejado
      data_registo: new Date(),
      urls: [newUrl._id] // ou outra inicialização necessária
    });
      await newWebsite.save();
      res.json(newWebsite);
    }

  });


  exports.website_update = asyncHandler(async (req, res) => {
    // Extrai o ID do website do corpo da solicitação
    const websiteId = req.body._id;
  
    // Verifica se o website com o ID fornecido existe no banco de dados
    const website = await Website.findById(websiteId);
    console.log(req.body);
    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }
  
    // Atualiza os campos do website com base nos dados fornecidos no corpo da solicitação
    website.url = req.body.url._id; // Use apenas o ObjectId do objeto Url
  
    if (!website.urls) {
      website.urls = []; // Inicializa a lista de URLs se ainda não existir
    }
  
    // Verifica se há novos elementos no array 'urls'
    if (req.body.urls && req.body.urls.length > 0) {
      // Itera sobre os novos elementos do array 'urls'
      for (const urlData of req.body.urls) {
        // Verifica se o URL já existe no banco de dados
        let existingUrl = await Url.findOne({ link: urlData.link });
  
        if (existingUrl) {
          // Se o URL já existe, atualiza os dados
          existingUrl.estado = urlData.estado;
          existingUrl.ultima_aval = urlData.ultima_aval;
          await existingUrl.save();
  
          // Verifica se o ID do URL já está na lista de URLs do website
          if (!website.urls.includes(existingUrl._id)) {
            // Adiciona o ID do URL existente à lista de URLs do website apenas se ainda não estiver lá
            website.urls.push(existingUrl._id);
          }
        } else {
          // Se o URL não existe, cria um novo URL
          const newUrl = new Url({
            link: urlData.link,
            estado: urlData.estado,
            ultima_aval: urlData.ultima_aval
          });
  
          await newUrl.save();
  
          // Adiciona o ID do novo URL à lista de URLs do website
          website.urls.push(newUrl._id);
        }
      }
    }
  
    // Salva as alterações no banco de dados
    await website.save();
    console.log(website);
  
    // Responde com o website atualizado
    res.json(website);
  });

exports.website_detail = asyncHandler(async (req, res, next) => {

  const website = await Website.findById(req.params.id).populate('url').populate('urls').exec();

  res.json(website);

});

exports.website_delete = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id).exec();
  const webUrl = await Url.findById(website.url);

  //await Website.findByIdAndDelete(req.params.urls.id)
  //if (website.urls == []) {
  //  console.log(website);
  //  for (const urlData of req.body.urls) {
  //    await Website.deleteMany(urlData);
  //  }
  //}
  //await Website.deleteOne(website.url);
  await Url.findByIdAndDelete(webUrl.id);
  await Website.findByIdAndDelete(website);
  //res.redirect("/catalog/websites");

});

exports.website_evaluate = asyncHandler(async (req, res, next) => {
  const qualweb = new QualWeb();
  const checkboxSelecionados = req.body;
  console.log(checkboxSelecionados);

  try {
    // Aqui você executa a avaliação com o QualWeb Core
    const resultadoAvaliacao = await qualweb.evaluateURL('URL_DA_PAGINA_A_SER_AVALIADA', {
      options: {
        selectOnly: checkboxSelecionados // Passando as opções selecionadas para a avaliação
      }
    });

    res.json(resultadoAvaliacao);
  } catch (error) {
    console.error('Erro na avaliação:', error);
    res.status(500).json({ error: 'Erro na avaliação' });
  }

});