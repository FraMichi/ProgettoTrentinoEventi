var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo agli alloggi
module.exports = mongoose.model('Housing', new Schema({
		titolo: String,
		descrizione: String,
		dataInizio: Date,
		dataFine: Date,
		indirizzo: String,
		citta: String,
		idGestore: String
}));
