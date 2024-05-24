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

exports.rules_list = asyncHandler(async (req, res, next) => {
  const repo_id = req.params.id
  const repo = await Reports.findById(repo_id)
  var rules = []
  for (let index = 0; index < repo.rules.length; index++) {
    const rule = await Rule.findById(repo.rules[index]._id)
    rules.push(rule)
  }
  res.json(rules);
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
  //console.log(report.rules[0]._id)

  var rules = []
  for (let index = 0; index < report.rules.length; index++) {
    const rule = await Rule.findById(report.rules[index]._id)
    rules.push(rule)
  }
  //console.log(rules)

  const newRepo = new Reports({
    link: report.link,
    rules: rules
  })

  res.json(newRepo);
});

exports.website_create_post = asyncHandler(async (req, res, next) => {
    const { link, estado, ultima_aval, errorA, errorAA, errorAAA, nTestesPassados, nTestesAvisos, nTestesFalhos, nTestesInaplicaveis, repo} = req.body;
    console.log(link);
    const urlExists = await Url.findOne({ link }).exec();
    if (urlExists) {
      // URL já existe, você pode decidir o que fazer aqui, talvez retornar um erro
      res.status(400).json({ message: "A URL já existe." });
    } else {
      // Crie um novo objeto Url
      console.log("teste1");
      console.log(estado);
      console.log(ultima_aval);
      const newUrl = new Url({ link, estado, ultima_aval, errorA, errorAA, errorAAA, nTestesPassados, nTestesAvisos, nTestesFalhos, nTestesInaplicaveis, repo});
      await newUrl.save();
      console.log("teste");
      // Crie um novo objeto Website com a referência para o novo objeto Url
      const newWebsite = new Website({
      url: newUrl._id, // Referência para o novo objeto Url
      estado: "PorAvaliar", // ou o estado padrão desejado
      data_registo: new Date(),
      urls: [newUrl._id] // ou outra inicialização necessária
    });
      console.log("teste");
      await newWebsite.save();
      
      const temp = await Website.findById(newWebsite._id).populate("url").populate("urls");
      console.log(newWebsite);
      res.json(temp);
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
            ultima_aval: urlData.ultima_aval,
            errorA: urlData.errorA,
            errorAA: urlData.errorAA,
            errorAAA: urlData.errorAAA,
            nTestesPassados: urlData.nTestesPassados,
            nTestesAvisos: urlData.nTestesAvisos,
            nTestesFalhos: urlData.nTestesFalhos,
            nTestesInaplicaveis: urlData.nTestesInaplicaveis,
            repo: urlData.repo,
          });
  
          await newUrl.save();
  
          // Adiciona o ID do novo URL à lista de URLs do website
          website.urls.push(newUrl._id);
        }
      }
    }
  
    // Salva as alterações no banco de dados
    await website.save();
    const temp = await Website.findById(website._id).populate("urls");
    console.log(temp);
  
    // Responde com o website atualizado
    res.json(temp);
  });

exports.website_detail = asyncHandler(async (req, res, next) => {

  const website = await Website.findById(req.params.id).populate('url').populate('urls').exec();

  res.json(website);

});

exports.url_detail = asyncHandler(async (req, res, next) => {
  console.log('ssssssssssssssssss'+req.params.id);
  const url = await Url.findById(req.params.id)

  res.json(url);

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

exports.website_delete_pag = asyncHandler(async (req, res, next) => {

  console.log(req.params.id);
  const webUrl = await Url.findById(req.params.id).exec();
  console.log(webUrl);

  await Url.findByIdAndDelete(webUrl._id);

});

exports.website_evaluate_website = asyncHandler(async (req, res, next) => {
  const checkboxSelecionados = req.body;
  const newCheckboxSelecionados = []
  const urlSites = {};

  const plugins = {
    // Check https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-adblocker
    adBlock: false, // Default value = false
  };

  const qualweb = new QualWeb(plugins);

  const clusterOptions = {
    maxConcurrency: 5, // Performs several urls evaluations at the same time - the higher the number given, more resources will be used. Default value = 1
    timeout: 60 * 1000, // Timeout for loading page. Default value = 30 seconds
    monitor: false // Displays urls information on the terminal. Default value = false
  };
  const launchOptions = {
    args: ['--no-sandbox', '--ignore-certificate-errors'] 
  };

  await qualweb.start(clusterOptions, launchOptions);

  try {
    
    for (const website of checkboxSelecionados) {
      //console.log(website.url.link)
      urlSites['url'] = website.url.link;
      //console.log(urlSites);

      const resultadoAvaliacao = await qualweb.evaluate(urlSites);
      const modules = resultadoAvaliacao[website.url.link]['modules']['act-rules']['assertions']
      console.log(resultadoAvaliacao[website.url.link]['modules']['act-rules']);
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
          name: module['name']
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
  console.log('Received URLs for evaluation:', checkboxSelecionados);
  const newCheckboxSelecionados = [];
  const urlSites = {};

  const plugins = {
    // Check https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-adblocker
    adBlock: false, // Default value = false
  };

  const qualweb = new QualWeb(plugins);
  const clusterOptions = {
    maxConcurrency: 5, // Maximum number of concurrent evaluations
    timeout: 60 * 1000, // Timeout for loading page (60 seconds)
    monitor: false // Do not display URLs information on the terminal
  };
  const launchOptions = {
    args: ['--no-sandbox', '--ignore-certificate-errors'] 
  };

  try {
    await qualweb.start(clusterOptions, launchOptions); // Start QualWeb with cluster options
    console.log('QualWeb started successfully with options:', clusterOptions);

    for (const url of checkboxSelecionados) {
      console.log('Evaluating URL:', url.link);
      urlSites['url'] = url.link;

      try {
        const resultadoAvaliacao = await qualweb.evaluate(urlSites);
        console.log('Evaluation result for URL:', url.link, resultadoAvaliacao);

        const modules = resultadoAvaliacao[url.link]['modules']['act-rules']['assertions'];
        const modulesWCAG = resultadoAvaliacao[url.link]['modules']['wcag-techniques']['assertions'];
        const rules = [];

        var errorA = false;
        var errorAA = false;
        var errorAAA = false;

        var passados = 0;
        var avisos = 0;
        var falhou = 0;
        var inac = 0;

        Object.values(modules).forEach(module => {
          let level = null;
          if (module['metadata']['success-criteria'][0]) {
            level = module['metadata']['success-criteria'][0]['level'];
          }
          if (level ==='A' && errorA === false) {
            errorA=true;
          }
          else if (level ==='AA' && errorAA === false) {
            errorAA=true;
          }
          else if (level ==='AAAA' && errorAAA === false) {
            errorAAA=true;
          }
          const rule = new Rule({
            ruleName: module['code'],
            ruleLevel: level,
            passed: module['metadata']['passed'],
            warning: module['metadata']['warning'],
            failed: module['metadata']['failed'],
            inapplicable: module['metadata']['inapplicable'],
            outcome: module['metadata']['outcome'],
            ruleType: 'ACT',
            name: module['name']
          });
          passados += module['metadata']['passed']
          avisos += module['metadata']['warning']
          falhou += module['metadata']['failed']
          inac += module['metadata']['inapplicable']

          rules.push(rule);
          rule.save();
        });

        Object.values(modulesWCAG).forEach(modulesWCAG => {
          let level = null;
          if (modulesWCAG['metadata']['success-criteria'][0]) {
            level = modulesWCAG['metadata']['success-criteria'][0]['level'];
          }
          if (level ==='A' && errorA === false) {
            errorA=true;
          }
          else if (level ==='AA' && errorAA === false) {
            errorAA=true;
          }
          else if (level ==='AAA' && errorAAA === false) {
            errorAAA=true;
          }
          const rule = new Rule({
            ruleName: modulesWCAG['code'],
            ruleLevel: level,
            passed: modulesWCAG['metadata']['passed'],
            warning: modulesWCAG['metadata']['warning'],
            failed: modulesWCAG['metadata']['failed'],
            inapplicable: modulesWCAG['metadata']['inapplicable'],
            outcome: modulesWCAG['metadata']['outcome'],
            ruleType: 'WCAG',
            name: module['name']
          });
          passados += modulesWCAG['metadata']['passed']
          avisos += modulesWCAG['metadata']['warning']
          falhou += modulesWCAG['metadata']['failed']
          inac += modulesWCAG['metadata']['inapplicable']

          rules.push(rule);
          rule.save();
        });

        const report = new Reports({
          link: url.link,
          rules: rules,
        });

        var estado = '';
        if (errorA || errorAA || errorAAA) {
          estado = 'NaoConforme'
        }
        else {
          estado = 'Conforme'
        }

        await report.save();
        await Url.findByIdAndUpdate(
          url._id,
          { estado: estado, ultima_aval: Date.now(), errorA: errorA, errorAA: errorAA, errorAAA: errorAAA, nTestesPassados: passados, nTestesAvisos: avisos, nTestesFalhos: falhou, nTestesInaplicaveis: inac, repo: report},
          { new: true }
        );

        const web = await Url.findOne({ link: url.link });
        newCheckboxSelecionados.push(web);

      } catch (evaluationError) {
        console.error('Error during evaluation for URL:', url.link, evaluationError);
      }
    }

    await qualweb.stop();
    console.log('QualWeb stopped successfully');
    console.log('dsadfsagfeafsda'+newCheckboxSelecionados);
    res.json(newCheckboxSelecionados);

  } catch (error) {
    console.error('Erro na avaliação:', error);
    res.status(500).json({ error: 'Erro na avaliação' });
  }
});

