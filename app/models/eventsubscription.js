var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo alle iscrizioni agli eventi
module.exports = mongoose.model('EventSubscription', new Schema({
		idEvento: String,
    idTurista: String
}));
