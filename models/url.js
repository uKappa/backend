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
    errorA: {type: Boolean},
    errorAA: {type: Boolean},
    errorAAA: {type: Boolean},
    nTestesPassados: {type: Number},
    nTestesAvisos: {type: Number},
    nTestesFalhos: {type: Number},
    nTestesInaplicaveis: {type: Number},
    repo: [{ type: Schema.Types.ObjectId, ref: "Reports" }]
  });

module.exports = mongoose.model("Url", UrlSchema);