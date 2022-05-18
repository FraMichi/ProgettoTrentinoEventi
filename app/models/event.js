var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo all'utente
module.exports = mongoose.model('Housing', new Schema({
    titolo: String,
    descrizione: String,
    dataInizio: Date,
    dataFine: Date,
    indirizzo: String,
    citta: String,
    postiDisponibili: Integer,
    postiTotali: Integer,
    idCategoria: String,
    idGestore: String,
}));
