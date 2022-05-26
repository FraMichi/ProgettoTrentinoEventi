const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const tokenChecker = require("./../tokenChecker.js");
const User = require('./../models/user');
const Event = require ('./../models/event');
const Housing = require ('./../models/housing');
const EventSubscription = require ('./../models/eventsubscription');
const HousingSubscription = require ('./../models/housingsubscription');

// Route per eliminazione evento
/**
 * @openapi
 * /api/v2/elimination/deleteEvent:
 *  delete:
 *   description: Controlla se il token é valido, l'alloggio esiste e l'utente è il creatore dell'evento
 *   summary: Elimina un evento
 *   tags:
 *    - eventElimination
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        token:
 *         type: string
 *         description: Contiene il token dell'utente loggato
 *        eventId:
 *         type: string
 *         description: Contiene l'id dell'evento
 *   responses:
 *    200:
 *     description: non ci sono errori e l'evento è stato eliminato correttamente
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
 *    401:
 *     description: Restituisce errore se il token non è valido
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
 *    403:
 *     description: Restituisce errore se l'utente non è proprietario dell'evento
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
 *    404:
 *     description: Restituisce errore se non è stato trovato l'utente
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
 */
router.delete('/deleteEvent', async (req, res) => {

  	// Controlla se il token è valido
    tokenChecker(req, res, req.body.token);

    // Se non è valido ritorna un messaggio di errore
    if(req.loggedUser == undefined) {
        res.status(401).json({
            success: false,
            message: 'Token non valido'
        });
        return;
    }

    // Prova a prendere l'evento dal database
  	let evento = await Event.findOne({ _id: req.body.eventId }).exec();

  	// Controlla se l'evento esiste, se no invia un messaggio di errore
  	if (!evento) {
		res.status(404).json({
        success: false,
        message: 'Evento non trovato'
        });
		return;
  	}

    // Controlla se l'utente è il creatore dell'evento, se no invia un messaggio di errore
    if(evento.idGestore != req.loggedUser.id) {
        res.status(403).json({
        success: false,
        message: "Non sei il proprietario dell'evento"
        });
		return;
    }

  	// Elimina l'evento dal DB
  	await Event.deleteOne({ _id: req.body.eventId });

    // Elimino tutte le iscrizioni relative a quell'evento
    await EventSubscription.deleteMany({ idEvento: req.body.eventId });

  	res.status(200).json({
    		success: true,
    		message: 'Evento eliminato!'
  	});
});

// Route per creazione evento
/**
 * @openapi
 * /api/v1/event/create:
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
 */
router.delete('/deleteHousing', async (req, res) => {

  	// Controlla se il token è valido
    tokenChecker(req, res, req.body.token);

    // Se non è valido ritorna un messaggio di errore
    if(req.loggedUser == undefined) {
        res.status(401).json({
            success: false,
            message: 'Token non valido'
        });
        return;
    }

    // Prova a prendere l'alloggio dal database
  	let alloggio = await Housing.findOne({ _id: req.body.housingId }).exec();

  	// Controlla se l'alloggio esiste, se no invia un messaggio di errore
  	if (!alloggio) {
		res.status(404).json({
        success: false,
        message: 'Alloggio non trovato'
        });
		return;
  	}

    // Controlla se l'utente è il creatore dell'alloggio, se no invia un messaggio di errore
    if(alloggio.idGestore != req.loggedUser.id) {
        res.status(403).json({
        success: false,
        message: "Non sei il proprietario dell'alloggio"
        });
		return;
    }

  	// Elimina l'alloggio dal DB
  	await Housing.deleteOne({ _id: req.body.housingId });

    // Elimino tutte le iscrizioni relative a quell'alloggio
    await HousingSubscription.deleteMany({ idAlloggio: req.body.housingId });

  	res.status(200).json({
    		success: true,
    		message: 'Alloggio eliminato!'
  	});
});

module.exports = router;
