var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Event', new Schema({
	titolo: String,
	descrizione: String,
	dataInizio: Date,
	dataFine: Date,
	indirizzo: String,
	citta: String,
	postiDisponibili: Number,
	postiTotali: Number,
	idCategoria: String,
	idGestore: String
}));
