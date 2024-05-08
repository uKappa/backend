const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Definindo o esquema do relatório
const ReportSchema = new Schema({
  url: { type: Schema.Types.ObjectId, ref: "Url" },
  //accessibilityMetrics: {
  //  type: Map, // Use Map para armazenar métricas de acessibilidade
  //  of: Number // Valores numéricos para as métricas
  //},
  date: {
    type: Date,
    default: Date.now // Data padrão é a data atual
  }
});

module.exports = mongoose.model('Reports', ReportSchema);
