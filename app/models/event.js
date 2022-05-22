var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo agli eventi
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
