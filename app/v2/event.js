const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const tokenChecker = require("./../tokenChecker.js");
const Housing = require('./../models/housing');
const User = require('./../models/user');
const Event = require ('./../models/event');
const Category = require ('./../models/category');

// Route per creazione evento
/**
 * @openapi
 * /api/v2/event/create:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea il nuovo evento caricandolo nel DB
 *   summary: Crea un nuovo evento
 *   tags:
 *    - eventCreation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        name:
 *         type: string
 *         description: Contiene il nome dell'evento
 *        description:
 *         type: string
 *         description: Contiene la descrizione dell'evento
 *        dstart:
 *         type: Date
 *         description: Contiene la data di inizio disponibilità dell'evento
 *        dend:
 *         type: Date
 *         description: Contiene la data di fine disponibilità dell'evento
 *        address:
 *         type: string
 *         description: Contiene l'indirizzo dell'evento
 *        city:
 *         type: string
 *         description: Contiene la città in cui si trova l'evento
 *        total:
 *         type: number
 *         description: Contiene il numero di utenti totali che si possono iscrivere all'evento
 *        idCategoria:
 *         type: string
 *         description: Contiene l'id della categoria dell'evento
 *        idUser:
 *         type: string
 *         description: Contiene l'id del gestore che ha creato l'evento
 *   responses:
 *    200:
 *     description: sono stati controllati tutti i campi e non sono stati trovati errori, si procede con il caricamento dell'evento sul DB
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
  	if (!req.body.name || !req.body.description || !req.body.dstart || !req.body.dend || !req.body.address || !req.body.city || !req.body.total || !req.body.idCategoria) {
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
  	if (req.body.dend < req.body.dstart) {
		res.status(400).json({
  			success: false,
  			message: 'La data di fine disponibilità è precedente alla data di inizio'
		});
		return;
  	}

    // Controlla se la categoria esiste nel Database
    let categoria = req.body.idCategoria;
    let categoriaFind = await Category.findOne({_id: categoria});
    if ( !categoriaFind ) {
		res.status(400).json({
  			success: false,
  			message: 'La categoria non è presente nel DB'
		});
		return;
  	}

    // Controlla se l'utente è un gestore
    let utente = await User.findOne({_id: req.body.userId})
    console.log(utente);
    if(utente.tipoDiUtente != 'gestore') {
		res.status(400).json({
  			success: false,
  			message: 'L\'utente non è un gestore'
		});
		return;
  	}

  	// Crea il nuovo evento
  	let evento = new Event({
        titolo: req.body.name,
        descrizione: req.body.description,
        dataInizio: req.body.dstart,
        dataFine: req.body.dend,
        indirizzo: req.body.address,
        citta: req.body.city,
        postiDisponibili: req.body.total,
        postiTotali: req.body.total,
        idCategoria: req.body.idCategoria,
        idGestore: req.body.userId,
    });

  	// Aggiunge l'evento creato nel DB
  	evento = await Event.create(evento);
  	res.status(200).json({
    		success: true,
    		message: 'Evento creato correttamente!'
  	});
});

module.exports = router;
