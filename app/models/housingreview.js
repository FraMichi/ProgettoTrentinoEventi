var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo alle iscrizioni agli eventi
module.exports = mongoose.model('HousingReview', new Schema({
  recensione: String,
  risposta: String,
  idAlloggio: String,
  idUtente: String,
  idGestore: String
}));
