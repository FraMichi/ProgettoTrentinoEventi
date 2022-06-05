const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const cookieParser = require("cookie-parser");
const tokenChecker = require("./../tokenChecker.js");

const Housing = require('./../models/housing');
const User = require('./../models/user');
const Event = require ('./../models/event');
const Category = require ('./../models/category');
const EventReview = require ('./../models/eventreview');
const HousingReview = require ('./../models/housingreview');
const EventSubscription = require('./../models/eventsubscription');
const HousingSubscription = require('./../models/housingsubscription');

// Route per eliminazione recensione evento  SCHEMA REQUEST
/**
 * @openapi
 * /api/v2/review/deleteEventReview:
 *  delete:
 *   description: Controlla se il token é valido, la recensione esiste e l'utente è il creatore della recensione evento
 *   summary: Elimina una recensione evento
 *   tags:
 *    - eventReviewElimination
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
 *         description: Contiene l'id dell'evento a cui lasciare una recensione
 *   responses:
 *    200:
 *     description: non ci sono errori e la recensione è stata eliminata correttamente
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
 *     description: Restituisce errore se l'utente non è proprietario della recensione
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
router.delete('/deleteEventReview', async (req, res) => {

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
		res.status(401).json({
        success: false,
        message: 'Evento non trovato'
        });
		return;
  	}

    // Prova a prendere la recensione dal database
  	let eventReview = await EventReview.findOne({idTurista: req.loggedUser.id, idEvento: req.body.eventId }).exec();


  	// Controlla se la recensione esiste, se no invia un messaggio di errore
  	if (!eventReview) {
		res.status(404).json({
        success: false,
        message: 'Recensione evento non trovata'
        });
		return;
  	}

  	// Elimina la recensione evento dal DB
  	await EventReview.deleteOne({ idTurista: req.loggedUser.id, idEvento: req.body.eventId });

  	res.status(200).json({
    		success: true,
    		message: 'Recensione evento eliminata!'
  	});
});

// Route per eliminazione recensione alloggio
/**
 * @openapi
 * /api/v2/review/deleteHousingReview:
 *  delete:
 *   description: Controlla se il token é valido, la recensione esiste e l'utente è il creatore della recensione alloggio
 *   summary: Elimina una recensione alloggio
 *   tags:
 *    - housingReviewElimination
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
 *         description: Contiene l'id dell'alloggio a cui lasciare una recensione
 *   responses:
 *    200:
 *     description: non ci sono errori e la recensione è stata eliminata correttamente
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
 *     description: Restituisce errore se l'utente non è proprietario della recensione
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
router.delete('/deleteHousingReview', async (req, res) => {

  // Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
if (!req.body.reviewId || !req.body.token ) {
res.status(400).json({
    success: false,
    message: 'Parametri mancanti'
});
return;
}

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

    // Prova a prendere la recensione dal database
  	let housingreview = await HousingReview.findOne({ _id: req.body.reviewId }).exec();

  	// Controlla se la recensione esiste, se no invia un messaggio di errore
  	if (!housingreview) {
		res.status(404).json({
        success: false,
        message: 'Recensione alloggio non trovata'
        });
		return;
  	}

  	// Elimina la recensione alloggio dal DB
  	await HousingReview.deleteOne({ _id: req.body.reviewId });

  	res.status(200).json({
    		success: true,
    		message: 'Recensione alloggio eliminata!'
  	});
});

module.exports = router;
