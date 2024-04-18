const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    url: { type: String, required: true, maxLength: 100 },
    estado: {
        type: String,
        required: true,
        enum: ["PorAvaliar", "EmAvaliacao", "Avaliado", "Erro"],
        default: "PorAvaliar",
      },
      urls: [{ type: String, maxLength: 100 }]
    // manter igual ao angular, possivel acrescentar mais coisas como as datas
  });

  module.exports = mongoose.model("Website", WebsiteSchema);