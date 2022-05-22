var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo alle categorie
module.exports = mongoose.model('Category', new Schema({
		tipoCategoria: String
}));
