const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('./models/user');

// Route per login
router.post('/login', async (req, res) => {

	// Cerca utente nel DB
	let user = await User.findOne({"email" : req.body.email.toString()}).exec();

	//S e l'utente non è stato trovato invia risposta con messaggio d'errore
	if (!user) {
		res.json({ success: false, message: 'Utente non trovato' });
		return;
	}

	// Se la password non è corretta invia risposta con messaggio d'errore
	if (user.password != req.body.password) {
		res.json({ success: false, message: 'Password sbagliata' });
		return;
	}


	// Creazione token

	var payload = {
		name: user.nome,
	    surname: user.cognome,
	    birthdate: user.dataDiNascita,
		email: user.email,
		password: user.password,
	    userType: user.tipoDiUtente,
		email: user.email,
		id: user.id
	}

	var options = {
		expiresIn: 120 //S cadenza dopo 2 minuti
	}

	var token = jwt.sign(payload, process.env.TOKEN_SECRET, options);


	// Creazione cookie contenente dati dell'utente tra cui il token ed il nome
	res.cookie('user', { token: token, name: user.nome});
    res.json({
		success: true
	});

});

// Route per registrazione
router.post('/subscribe', async (req, res) => {

	// Controlla se l'utente è già esistente nel DB
	let userDB = await User.findOne({"email" : req.body.email.toString()}).exec();

	// Se l'utente è stato trovato invia risposta con messaggio d'errore
	if (userDB) {
		res.json({ success: false, message: 'Utente già esistente' });
		return;
	}

	// Se l'utente non è stato trovato, lo crea
	let user = new User({
		nome: req.body.name,
	    cognome: req.body.surname,
	    dataDiNascita: req.body.birthdate,
		email: req.body.email,
		password: req.body.password,
	    tipoDiUtente: req.body.userType
    });

	// Aggiunge l'utente creato nel DB
	user = await user.save();


	// Creazione token

	var payload = {
		name: user.nome,
		surname: user.cognome,
		birthdate: user.dataDiNascita,
		email: user.email,
		password: user.password,
		userType: user.tipoDiUtente,
		email: user.email,
		id: user.id
	}

	var options = {
		expiresIn: 120 // Scadenza dopo 2 minuti
	}

	var token = jwt.sign(payload, process.env.TOKEN_SECRET, options);


	// Creazione cookie contenente dati dell'utente tra cui il token ed il nome
	res.cookie('user', { token: token, name: user.nome});

    res.json({
		success: true
	});

});

// Route per controllare se utente è loggato
router.get('', async (req, res) => {

    // Prende il cookie contenente i dati dell'utente
    var userCookie = req.cookies['user'];

    // Controlla se il cookie è settato
    if(!userCookie) {

        // In caso non sia settato, manda un messaggio di errore
        res.json({
			success: false,
			message: 'Cookie non trovato'
		});
		return;
	}

	// Prende il token ed il nome dell'utente dal cookie
	var userName = userCookie.name;
	token = userCookie.token;

	// Verifica il token ed invia una risposta in base al risultato
	jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {

		if (err) {

			// Se il token non è valido manda un messaggio di errore
			res.json({
				success: false,
				message: 'Token non valido'
			});
		} else {

			// Se il token è valido manda un messaggio di validità e il nome dell'utente
			res.json({
				success: true,
				name: userName,
				message: 'Token valido'
			});
		}
	});
});


module.exports = router;
