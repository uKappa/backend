const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Definindo o esquema do relatório
const ReportSchema = new Schema({
  rules: [{ type: Schema.Types.ObjectId, ref: "Rule" }],
});

module.exports = mongoose.model('Reports', ReportSchema);
