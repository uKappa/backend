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