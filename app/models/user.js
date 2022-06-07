var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo all'utente
module.exports = mongoose.model('User', new Schema({
    nome: String,
    cognome: String,
    dataDiNascita: Date,
    email: String,
    password: String,
    tipoDiUtente: String
}));
