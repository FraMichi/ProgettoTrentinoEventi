var mongoose = require('mongoose');
var Schema = mongoose.Schema;

<<<<<<< HEAD
// Crea il modello relativo all'utente
module.exports = mongoose.model('Housing', new Schema({
    titolo: String,
    descrizione: String,
    dataInizio: Date,
    dataFine: Date,
    indirizzo: String,
    citta: String,
    idGestore: String,
=======
// set up a mongoose model
module.exports = mongoose.model('Housing', new Schema({
	titolo: String,
	descrizione: String,
	dataInizio: Date,
	dataFine: Date,
	indirizzo: String,
	citta: String,
	idGestore: String
>>>>>>> main
}));
