var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('EventSubscription', new Schema({
	idEvento: String,
    idTurista: String
});
