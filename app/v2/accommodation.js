const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const tokenChecker = require("./../tokenChecker.js");
const Housing = require('./../models/housing');
const User = require('./../models/user');
const Event = require ('./../models/event');

// Router per creazione alloggio
/**
 * @openapi
 * /api/v2/accommodation/create:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea il nuovo alloggio caricandolo nel DB
 *   summary: Crea un nuovo alloggio
 *   tags:
 *    - accommodation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        name:
 *         type: string
 *         description: Contiene il nome dell'alloggio
 *        description:
 *         type: string
 *         description: Contiene la descrizione dell'alloggio
 *        dstart:
 *         type: date
 *         description: Contiene la data di inizio disponibilità dell'alloggio
 *        dend:
 *         type: data
 *         description: Contiene la data di fine disponibilità dell'alloggio
 *        address:
 *         type: string
 *         description: Contiene l'indirizzo dell'alloggio
 *        city:
 *         type: string
 *         description: Contiene la città in cui si trova l'alloggio
 *        idUser:
 *         type: string
 *         description: Contiene l'id del gestore che ha creato l'alloggio
 *   responses:
 *    200:
 *     description: sono stati controllati tutti i campi e non sono stati trovati errori, si procede con il caricamento dell'alloggio sul DB
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true dato che tutti i campi sono corretti
 *         message:
 *          type: string
 *          description: Messaggio che contiene un messaggio di successo
 *    400:
 *     description: Restituisce errore se non sono stati inseriti tutti i campi o se non sono corretti!
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale false ed indica che ci sono stati errori
 *         message:
 *          type: string
 *          description: Messaggio che contiene l'errore
 *    401:
 *     description: Restituisce errore se non sono stati inseriti tutti i campi o se non sono corretti!
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale sempre false
 *         message:
 *          type: string
 *          description: Il token non è valido, l'utente non è loggato
 */
router.post('/create', async (req, res) => {

    // Verifica se utente loggato
    tokenChecker(req, res, req.body.token);

    // Se utente non loggato
    if(req.loggedUser == undefined) {
        // Ritorna codice 401
        res.status(401).json({
            success: false,
            message: 'Utente non loggato'
        });
        return;
    }

    // Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
    if (!req.body.name || !req.body.description || !req.body.dstart || !req.body.dend || !req.body.address || !req.body.city) {
    		res.status(400).json({
      			success: false,
      			message: 'Inserire tutti i campi'
    		});
    		return;
  	}

  	// Controlla se la data di inizio e fine sono nel formato corretto, se no invia risposta con messaggio d'errore
    var date_regex = /^([1-9][0-9][0-9][0-9])\-(0[1-9]|1[0-2])\-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;
  	if (!date_regex.test(req.body.dstart)) {
    		res.status(400).json({
      			success: false,
      			message: 'Formato data non corretto'
    		});
    		return;
  	}
  	if (!date_regex.test(req.body.dend)) {
    		res.status(400).json({
      			success: false,
      			message: 'Formato data non corretto'
    		});
    		return;
  	}

  	// Controlla se la data di inizio è prima della data di fine, se no invia risposta con messaggio d'errore
  	if (req.body.dend <= req.body.dstart) {
    		res.status(400).json({
      			success: false,
      			message: 'La data di fine disponibilità e precedente alla data di inizio'
    		});
    		return;
  	}

    // Controlla se l'utente è un gestore
    let utente = await User.findOne({_id: req.body.userId})
    if(utente.tipoDiUtente != 'gestore') {
		res.status(400).json({
  			success: false,
  			message: 'L\'utente non è un gestore'
		});
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
        idGestore: req.body.userId,
    });

  	// Aggiunge l'alloggio creato nel DB e restituisce un messaggio di conferma
  	housing = await housing.save();
  	res.status(200).json({
    		success: true,
    		message: 'Alloggio creato correttamente!'
  	});
});


module.exports = router;
