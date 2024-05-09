const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Definindo o esquema do relatório
const RuleSchema = new Schema({
  ruleName: {type: String},
  ruleLevel: {type: String},
  passed: 0,
  warning: 0,
  failed: 0,
  inapplicable: 0,
  outcome: {type: String}
});

module.exports = mongoose.model('Rule', RuleSchema);
