const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    url: { type: Schema.Types.ObjectId, ref: "Url"},
    estado: {
        type: String,
        required: true,
        enum: ["PorAvaliar", "EmAvaliacao", "Avaliado", "Erro"],
        default: "PorAvaliar",
      },
      data_registo: {type: Date},
      urls: [{ type: Schema.Types.ObjectId, ref: "Url" }]
    // manter igual ao angular, possivel acrescentar mais coisas como as datas
  });

  module.exports = mongoose.model("Website", WebsiteSchema);