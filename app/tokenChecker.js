const jwt = require("jsonwebtoken");

const tokenChecker = function(req, res, token){
    // Se non c'è il token
    if (!token){
        // Ritorna errore
        return false;
    }

    // Decodifica il token e controllane la validità
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err){
            // Ritorna errore
            return false;
        } else {
            // Se tutto va bene, imposta il parametro nella request
            req.loggedUser = decoded;
            return true;
        }
    });
};

module.exports = tokenChecker;
