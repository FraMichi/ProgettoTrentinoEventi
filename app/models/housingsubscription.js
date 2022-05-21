var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('HousingSubscription', new Schema({
	idAlloggio: String,
    idTurista: String,
	dataInizio: String,
	dataFine: String
}));
