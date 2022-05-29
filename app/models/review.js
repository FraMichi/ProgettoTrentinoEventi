var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo alle review
module.exports = mongoose.model('Review', new Schema({
    nome: String,
    cognome: String,
	  email: String,
	  messaggio: String
}));
