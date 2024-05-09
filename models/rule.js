const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Definindo o esquema do relatório
const RuleSchema = new Schema({
  ruleName: {type: String},
  ruleLevel: {type: String},
  passed: {type: Number},
  warning: {type: Number},
  failed: {type: Number},
  inapplicable: {type: Number},
  outcome: {type: String}
});

module.exports = mongoose.model('Rule', RuleSchema);
