var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Crea il modello relativo all'utente
module.exports = mongoose.model('Category', new Schema({
    tipoCategoria: String
}));
