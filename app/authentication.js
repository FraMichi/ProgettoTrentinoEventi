const express = require('express');
const router = express.Router();
const User = require('./models/user');

// Route per autenticazione
router.post('', async (req, res) => {

	//Cerca utente nel DB
	let user = await User.findOne({"email" : req.body.email.toString()}).exec();

	//Se l'utente non è stato trovato invia risposta con messaggio d'errore
	if (!user) {
		res.json({ success: false, message: 'Utente non trovato' });
	}

	//Se la password non è corretta invia risposta con messaggio d'errore
	if (user.password != req.body.password) {
		res.json({ success: false, message: 'Password sbagliata' });
	}

    //Se non ci sono errori crea il cookie ed invia risposta di successo
    res.cookie('user', { name: user.nome, userType: user.tipoDiUtente, userId: user._id});
    res.json({
		success: true
	});

});

// Route per controllare se utente è loggato
router.get('', async (req, res) => {

    //Prende il cookie 'user'
    var userCookie = req.cookies['user'];

    var set;
    var userName;
    var type;

    //Controlla se il cookie è settato
    if(userCookie) {
        //In caso affermativo si salva nome e tipo dell'utente
        set = 'True';
        userName = userCookie.name;
        type = userCookie.userType;
    } else {
        set = 'False';
    }

    //Invia risposta
    res.status(200).json({
        success: true,
        result: set,
        name: userName,
        userType: type
    });

});


module.exports = router;
