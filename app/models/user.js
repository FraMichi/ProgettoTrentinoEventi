var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({
	nome: String,
    cognome: String,
    dataDiNascita: Date,
    email: String,
    password: String,
    tipoDiUtente: String
}));
