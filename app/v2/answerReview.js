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

// Route per creazione risposta recensione evento
/**
 * @openapi
 * /api/v2/answerReview/createAnswerEventReview:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea una risposta alla recensione ad un evento caricandola nel DB
 *   summary: Crea una risposta ad una recensione evento
 *   tags:
 *    - eventAnswerReviewCreation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        answer:
 *         type: string
 *         description: Contiene la risposta del gestore evento alla recensione
 *        idEvento:
 *         type: string
 *         description: Contiene l'id dell'evento
 *        idUtente:
 *         type: string
 *         description: Contiene l'id dell'utente che scrive la recensione
 *        idGestore:
 *         type: string
 *         description: Contiene l'id del gestore che può rispondere alla recensione
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
 *    401:
 *      description: The user is not logged
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              success:
 *                type: boolean
 *              message:
 *                type: string
 *                description: |
 *                  UserNotLogged => the user has not provided a valid token, therefore the user is not logged
 */
router.post('/createAnswerEventReview', async (req, res) => {

	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
	if (!req.body.token || !req.body.answer || !req.body.reviewId || !req.body.eventId) {
	res.status(400).json({
    	success: false,
    	message: 'Inserire tutti i campi'
	});
  return;
	}

  // Verifica se utente loggato
  tokenChecker(req, res, req.body.token);

  // Se utente non loggato (token decoded nella req = undefined)
  if(req.loggedUser == undefined) {
      // Ritorna codice 401
      res.status(401).json({
          success: false,
          message: 'UserNotLogged'
      });
      return;
  }

  // Controlla che l'idEvento rispetti il formato di MongoDB
  if (!req.body.eventId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({
          success: false,
          message: "Id non conforme al formato MongoDB"
      });
      return;
  }

  let evento = await Event.findOne({_id: req.body.eventId}).exec();

  // Controlla se l'evento esiste, se no invia un messaggio di errore
     if (!evento) {
     res.status(401).json({
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

  if (!req.body.reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({
          success: false,
          message: "Id non conforme al formato MongoDB"
      });
      return;
  }

 await EventReview.update({ _id: req.body.reviewId},{risposta: req.body.answer, idGestore: req.loggedUser.id}).exec();

 res.status(200).json({
    		success: true,
    		message: 'Risposta recensione inviata!'
  	});

});

// Route per creazione risposta recensione alloggio
/**
 * @openapi
 * /api/v2/answerReview/createAnswerHousingReview:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea risposta ad una recensione ad un alloggio caricandola nel DB
 *   summary: Crea una risposta ad una recensione alloggio
 *   tags:
 *    - housingAnswerReviewCreation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        answer:
 *         type: string
 *         description: Contiene la risposta del gestore dell'alloggio alla recensione
 *        idAlloggio:
 *         type: string
 *         description: Contiene l'id dell'alloggio a cui si vuole lasciare una recensione
 *        idUtente:
 *         type: string
 *         description: Contiene l'id dell'utente che scrive la recensione
 *        idGestore:
 *         type: string
 *         description: Contiene l'id del gestore che può rispondere alla recensione
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
 *    401:
 *      description: The user is not logged
 *      content:
 *        application/json:
 *          schema:
 *            properties:
 *              success:
 *                type: boolean
 *              message:
 *                type: string
 *                description: |
 *                  UserNotLogged => the user has not provided a valid token, therefore the user is not logged
*/
router.post('/createAnswerHousingReview', async (req, res) => {

  // Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
    if (!req.body.reviewId || !req.body.housingId || !req.body.token || !req.body.answer ) {
    res.status(400).json({
        success: false,
        message: 'Parametri mancanti'
    });
    return;
    }

  // Verifica se utente loggato
  tokenChecker(req, res, req.body.token);

  // Se utente non loggato (token decoded nella req = undefined)
  if(req.loggedUser == undefined) {
      // Ritorna codice 401
      res.status(401).json({
          success: false,
          message: 'UserNotLogged'
      });
      return;
  }
  // Controlla che l'idAlloggio rispetti il formato di MongoDB
  if (!req.body.housingId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({
          success: false,
          message: "Id non conforme al formato MongoDB"
      });
      return;
  }


  let house = await Housing.findOne({_id: req.body.housingId}).exec();

  // Controlla se l'alloggio esiste, se no invia un messaggio di errore
   if (!house) {
   res.status(401).json({
       success: false,
       message: 'Alloggio non trovato'
       });
   return;
   }

// Controlla se l'utente è il proprietario dell'alloggio, se no invia un messaggio di errore
if(house.idGestore != req.loggedUser.id) {
    res.status(403).json({
    success: false,
    message: "Non sei il proprietario dell'alloggio"
    });
return;
}

if (!req.body.reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({
          success: false,
          message: "Id non conforme al formato MongoDB"
      });
      return;
  }

  await HousingReview.update({ _id: req.body.reviewId},{risposta: req.body.answer, idGestore: req.loggedUser.id}).exec();

 res.status(200).json({
    		success: true,
    		message: 'Risposta recensione inviata!'
  	});
});

module.exports = router;
