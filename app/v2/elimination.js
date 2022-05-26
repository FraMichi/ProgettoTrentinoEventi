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
 *   description: Controlla se il token é valido, l'evento esiste e l'utente è il creatore dell'evento
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
 *    400:
 *     description: Restituisce errore se l'id dell'evento non rispetta il formato di mongoDB
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

    // Controlla validita dell'id dell'evento
    if (!req.body.eventId.match(/^[0-9a-fA-F]{24}$/)) {
        // Se non lo rispetta ritorna un errore
        res.status(400).json({
            success: false,
            message: "MongoDBFormatException"
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

// Route per eliminazione alloggio
/**
 * @openapi
 * /api/v2/elimination/housingEvent:
 *  delete:
 *   description: Controlla se il token é valido, l'alloggio esiste e l'utente è il creatore dell'alloggio
 *   summary: Elimina un alloggio
 *   tags:
 *    - housingElimination
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        token:
 *         type: string
 *         description: Contiene il token dell'utente loggato
 *        housingId:
 *         type: string
 *         description: Contiene l'id dell'alloggio
 *   responses:
 *    200:
 *     description: non ci sono errori e l'alloggio è stato eliminato correttamente
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
 *     description: Restituisce errore se l'utente non è proprietario dell'alloggio
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
