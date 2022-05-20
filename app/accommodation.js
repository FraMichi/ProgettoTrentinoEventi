const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Housing = require('./models/housing');
const User = require('./models/user');
const Event = require ('./models/event');

// Route per creazione alloggio
router.post('/create', async (req, res) => {
	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
	if (!req.body.name || !req.body.description || !req.body.dstart || !req.body.dend || !req.body.address || !req.body.city) {
		res.status(400).json({ success: false, message: 'Inserire tutti i campi' });
		return;
	}

	// Controlla se la data di inizio è nel formato corretto, se no invia risposta con messaggio d'errore
  var date_regex = /^([1-9][0-9][0-9][0-9])\-(0[1-9]|1[0-2])\-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;
	if (!date_regex.test(req.body.dstart)) {
		res.status(400).json({ success: false, message: 'Formato data non corretto' });
		return;
	}

	// Controlla se la data di fine è nel formato corretto, se no invia risposta con messaggio d'errore
	if (!date_regex.test(req.body.dend)) {
		res.status(400).json({ success: false, message: 'Formato data non corretto' });
		return;
	}

	// Controlla se la data di inizio è prima della data di fine, se no invia risposta con messaggio d'errore
	if (req.body.dend <= req.body.dstart) {
		res.status(400).json({ success: false, message: 'La data di fine disponibilità e precedente alla data di inizio' });
		return;
	}

	// Crea il nuovo alloggio
	let housing = new Housing({
		titolo: req.body.name,
	  descrizione: req.body.description,
	  dataInizio: req.body.dstart,
		dataFine: req.body.dend,
		indirizzo: req.body.address,
	  citta: req.body.city,
		idGestore: req.body.idUser,
    });

	// Aggiunge l'alloggio creato nel DB
	housing = await housing.save();

	res.status(200).json({
		success: true
	});
});


module.exports = router;
