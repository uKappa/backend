const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Definindo o esquema do relatório
const ReportSchema = new Schema({
    link: { type: String, required: true, maxLength: 100 },
    rules: [{ type: Schema.Types.ObjectId, ref: "Rule" }],
});

module.exports = mongoose.model('Reports', ReportSchema);
