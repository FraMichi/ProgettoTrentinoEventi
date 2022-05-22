const jwt = require("jsonwebtoken");

const tokenChecker = function(req, res, specToken){

    // Ottieni il token dello user loggato
    let token = specToken;

    // Se non c'è il token
    if (!token){
        // Ritorna errore
        //res.status(401).json({success:false,message:'No token provided'})
        return false;
    }

    // Decodifica il token e controllane la validità
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err){
            //res.status(401).json({success:false,message:'Token not valid'});
            return false;
        } else {
            // If everything is good, save in req object for use in other routes
            //res.status(401).json({success:false,message:'Token valid'});  //DEBUG
            req.loggedUser = decoded;
        }
    });
};

module.exports = tokenChecker;
