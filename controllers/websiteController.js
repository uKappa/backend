const Website = require("../models/website");
const Url = require("../models/url");
const Reports = require("../models/report");
const Rule = require("../models/rule");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { QualWeb, generateEARLReport } = require('@qualweb/core');


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

exports.reports_list = asyncHandler(async (req, res, next) => {
  const allReports = await Reports.find()
  .sort({ date: 1 })
  .exec();

  res.json(allReports);
});

exports.return_report = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  //const webs = await Website.find()
  //console.log(webs)
  const web = await Website.findById(id);
  const url = web.url
  const report = await Reports.findOne({ url: url.link });
  console.log(report.rules[0]._id)

  var rules = []
  for (let index = 0; index < report.rules.length; index++) {
    const rule = await Rule.findById(report.rules[index]._id)
    rules.push(rule)
  }
  console.log(rules)

  const newRepo = new Reports({
    link: report.link,
    rules: rules
  })

  res.json(newRepo);
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

  website.urls.forEach(async url => {
    await Url.findByIdAndDelete(url._id);
  });

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

exports.website_evaluate_website = asyncHandler(async (req, res, next) => {
  const checkboxSelecionados = req.body;
  const newCheckboxSelecionados = []
  const urlSites = {};
  const qualweb = new QualWeb();
  const clusterOptions = {
    maxConcurrency: 5, // Performs several urls evaluations at the same time - the higher the number given, more resources will be used. Default value = 1
    timeout: 60 * 1000, // Timeout for loading page. Default value = 30 seconds
    monitor: false // Displays urls information on the terminal. Default value = false
  };

  await qualweb.start(clusterOptions)

  try {
    
    for (const website of checkboxSelecionados) {
      console.log(website.url.link)
      urlSites['url'] = website.url.link;
      console.log(urlSites);

      const resultadoAvaliacao = await qualweb.evaluate(urlSites);
      const modules = resultadoAvaliacao[website.url.link]['modules']['act-rules']['assertions']
      const rules = [];
      Object.values(modules).forEach(module => {
        let level = null
        if(module['metadata']['success-criteria'][0]) {
          level = module['metadata']['success-criteria'][0]['level']
        }
        const rule = new Rule({
          ruleName: module['code'],
          ruleLevel: level,
          passed: module['metadata']['passed'],
          warning: module['metadata']['warning'],
          failed: module['metadata']['failed'],
          inapplicable: module['metadata']['inapplicable'],
          outcome: module['metadata']['outcome'],
        })
        rules.push(rule)

      });
      const report = new Reports({
        link: website.url.link,
        rules: rules
      })
      //console.log(report)

      await report.save();

      await Website.findByIdAndUpdate(
        website._id, // Critério de pesquisa para encontrar o documento a ser atualizado
        { estado: 'Avaliado' }, // Os campos que você deseja atualizar e seus novos valores
        { data_registo: Date.now() },
        { new: true }, // Opção para retornar o documento atualizado
      );
      //website.estado = 'Avaliado'
      //console.log(website.estado)
      const web = await Website.findById(website._id);
      newCheckboxSelecionados.push(web);
    }
    //console.log(newCheckboxSelecionados);
    //console.log(checkboxSelecionados);

    await qualweb.stop();
    res.json(newCheckboxSelecionados);
  } catch (error) {
    console.error('Erro na avaliação:', error);
    res.status(500).json({ error: 'Erro na avaliação' });
  }
});

exports.website_evaluate_url = asyncHandler(async (req, res, next) => {
  const checkboxSelecionados = req.body;
  console.log(checkboxSelecionados);
  const newCheckboxSelecionados = []
  const urlSites = {};
  const qualweb = new QualWeb();
  const clusterOptions = {
    maxConcurrency: 5, // Performs several urls evaluations at the same time - the higher the number given, more resources will be used. Default value = 1
    timeout: 60 * 1000, // Timeout for loading page. Default value = 30 seconds
    monitor: false // Displays urls information on the terminal. Default value = false
  };

  await qualweb.start(clusterOptions)

  try {
    
    for (const url of checkboxSelecionados) {
      //console.log(url.link)
      urlSites['url'] = url.link;
      //console.log(urlSites);

      const resultadoAvaliacao = await qualweb.evaluate(urlSites);
      const modules = resultadoAvaliacao[url.link]['modules']['act-rules']['assertions']
      const rules = [];
      Object.values(modules).forEach(module => {
        let level = null
        if(module['metadata']['success-criteria'][0]) {
          level = module['metadata']['success-criteria'][0]['level']
        }
        const rule = new Rule({
          ruleName: module['code'],
          ruleLevel: level,
          passed: module['metadata']['passed'],
          warning: module['metadata']['warning'],
          failed: module['metadata']['failed'],
          inapplicable: module['metadata']['inapplicable'],
          outcome: module['metadata']['outcome'],
        })
        rules.push(rule)
        rule.save()

      });
      const report = new Reports({
        link: url.link,
        rules: rules
      })
      //console.log(report)

      await report.save();

      await Url.findByIdAndUpdate(
        url._id,
        { estado: 'Avaliado' },
        { ultima_aval: Date.now() },
        { new: true },
      )

      const web = await Url.findOne({url: url.link});

      //await Website.findByIdAndUpdate(
      //  website._id, // Critério de pesquisa para encontrar o documento a ser atualizado
      //  { estado: 'Avaliado' }, // Os campos que você deseja atualizar e seus novos valores
      //  { data_registo: Date.now() },
      //  { new: true }, // Opção para retornar o documento atualizado
      //);
      //website.estado = 'Avaliado'
      //console.log(website.estado)
      //const web = await Website.findById(website._id);
      newCheckboxSelecionados.push(web);
    }
    //console.log(newCheckboxSelecionados);
    //console.log(checkboxSelecionados);

    await qualweb.stop();
    res.json(newCheckboxSelecionados);
  } catch (error) {
    console.error('Erro na avaliação:', error);
    res.status(500).json({ error: 'Erro na avaliação' });
  }
});

exports.website_delete_pag = asyncHandler(async (req, res, next) => {

  const webUrl = await Url.findById(req.params.id).exec();
  await Url.findByIdAndDelete(webUrl.id);

});