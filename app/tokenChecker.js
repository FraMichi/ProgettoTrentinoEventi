const jwt = require("jsonwebtoken");

const tokenChecker = function(req, res){
    // ottieni il cookie contenente il token dello user loggato
    var userCookie = req.cookies['user'];

    // se il cookie non esiste
    if(userCookie == undefined){
        // ritorna errore
        //res.status(401).json({success:false,message:'User not logged'});
        return;
    }

    // ottieni il token dal cookie
    var token = userCookie.token;

    // se non c'è il token
    if (!token){
        // ritorna errore
        //res.status(401).json({success:false,message:'No token provided'})
        return;
    }

    // decodifica il token e controllane la validità
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {
        if (err) res.status(401).json({success:false,message:'Token not valid'})
        else {
            // if everything is good, save in req object for use in other routes
            //res.status(401).json({success:false,message:'Token valid'});  //DEBUG
            req.loggedUser = decoded;
        }
    });
};

module.exports = tokenChecker;
