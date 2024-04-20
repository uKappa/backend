const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UrlSchema = new Schema({
    link: { type: String, required: true, maxLength: 100 },
    estado: {
        type: String,
        required: true,
        enum: ["Conforme", "Naoconforme"],
        default: "Naoconforme",
      },
      ultima_aval: {type: Date}
    // manter igual ao angular, possivel acrescentar mais coisas como as datas
  });

module.exports = mongoose.model("Url", UrlSchema);