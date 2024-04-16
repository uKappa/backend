const Website = require("../models/website");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


exports.website_list = asyncHandler(async (req, res, next) => {
    const allWebsites = await Website.find()
    .sort({ id: 1 })
    .exec();

    res.json(allWebsites);
});