var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Housing', new Schema({
	titolo: String,
	descrizione: String,
	dataInizio: Date,
	dataFine: Date,
	indirizzo: String,
	citta: String,
	idGestore: String
}));
