var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo alle iscrizioni agli eventi
module.exports = mongoose.model('EventReview', new Schema({
  recensione: String,
  risposta: String,
  idEvento: String,
  idUtente: String,
  idGestore: String
}));
