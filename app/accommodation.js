const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Housing = require('./models/housing');

// Route per creazione alloggio
router.post('/create', async (req, res) => {

	// Prende il cookie contenente i dati dell'utente
	var userCookie = req.cookies['user'];
	var idUser = userCookie._id;

	// Crea il nuovo alloggio
	let housing = new Housing({
		titolo: req.body.name,
	  descrizione: req.body.description,
	  dataInizio: req.body.dstart,
		dataFine: req.body.dend,
		indirizzo: req.body.address,
	  citta: req.body.city,
		idGestore: idUser
    });

	// Aggiunge l'alloggio creato nel DB
	housing = await housing.save();

	//messaggio di conferma?
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
	var token = userCookie.token;
	var idUser = userCockie.idUser;

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
