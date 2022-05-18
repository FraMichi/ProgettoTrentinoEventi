const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Event = require('./models/event');

// Route per creazione alloggio
router.post('/create', async (req, res) => {

	// Prende il cookie contenente i dati dell'utente
	var userCookie = req.cookies['user'];
	var idUser = userCookie.idUser;

	// Crea il nuovo evento
	let evento = new Event({
		titolo: req.body.name,
	  descrizione: req.body.description,
	  dataInizio: req.body.dstart,
		dataFine: req.body.dend,
		indirizzo: req.body.address,
	  citta: req.body.city,
    postiDisponibili: req.body.postiTotali,
    postiTotali: req.body.postiTotali,
    idCategoria: req.body.idCategoria,
		idGestore: idUser
    });

	// Aggiunge l'evento creato nel DB
	evento = await evento.save();

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
