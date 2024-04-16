const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    id: { type: Number, required: true},
    url: { type: String, required: true, maxLength: 100 },
    estado: {
        type: String,
        required: true,
        enum: ["PorAvaliar", "EmAvaliacao", "Avaliado", "Erro"],
        default: "PorAvaliar",
      },
    // manter igual ao angular, possivel acrescentar mais coisas como as datas
  });

  module.exports = mongoose.model("Website", WebsiteSchema);