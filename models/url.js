const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UrlSchema = new Schema({
    link: { type: String, required: true, maxLength: 100 },
    estado: {
        type: String,
        required: true,
        enum: ["Conforme", "Naoconforme", "ErroNaAvaliacao", "EmAvaliacao", "PorAvaliar"],
        default: "PorAvaliar",
    },
    ultima_aval: {type: Date},
    errorA: {type: Number},
    errorAA: {type: Number},
    errorAAA: {type: Number}
  });

module.exports = mongoose.model("Url", UrlSchema);