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

// Route per creazione recensione evento
/**
 * @openapi
 * /api/v2/review/createEventReview:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea una recensione ad un evento caricandola nel DB
 *   summary: Crea una recensione evento
 *   tags:
 *    - eventReviewCreation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *         description: Contiene la recensione dell'evento
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
router.post('/createEventReview', async (req, res) => {

  // Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  if (!req.body.review || !req.body.idEvento || !req.body.token  ) {
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

  // Controlla che l'id rispetti il formato di MongoDB
  if (!req.body.idEvento.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({
          success: false,
          message: "Id non conforme al formato MongoDB"
      });
      return;
  }

  // Se user loggato controlla se già registrato ad evento specifico
  let iscrizione = await EventSubscription.findOne({idTurista: req.loggedUser.id, idEvento: req.body.idEvento});

  // Se non iscritto
  if(!iscrizione) {
      // Segnala che l'utente non è iscritto
      res.status(200).json({
          success: false,
          message: 'UserNotSubscribed'
      });
      return;
  }

 let evento = await Event.findOne({_id: req.body.idEvento});

  //Controllo data evento sia passata
    var oggi = new Date();
    let dend = evento.dataFine;

      var diff = dend.getTime()  - oggi.getTime();
      //la data di fine evento è maggiore della data di oggi, evento deve ancora avvenire
      if (diff >= 0) {
        // Ritorna codice 401
        res.status(401).json({
            success: false,
            message: 'Evento ancora non avvenuto'
        });
        return;
          };

    // Crea la recensione evento
  	let eventReview = new EventReview({
        recensione: req.body.review,
        idEvento: req.body.idEvento,
        idUtente: req.loggedUser.id,
        idGestore: undefined,
        risposta: undefined
    });

  	// Aggiunge la recensione creata nel DB
  	eventReview = await eventReview.save();
  	res.status(201).json({
    		success: true,
    		message: 'Recensione evento creata correttamente!'
  	});
});

// Route per creazione recensione alloggio
/**
 * @openapi
 * /api/v2/review/createHousingReview:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea una recensione ad un alloggio caricandola nel DB
 *   summary: Crea una recensione alloggio
 *   tags:
 *    - housingReviewCreation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        message:
 *         type: string
 *         description: Contiene la recensione dell'alloggio
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
router.post('/createHousingReview', async (req, res) => {

  // Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
    if (!req.body.review || !req.body.idAlloggio || !req.body.token  ) {
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
  if (!req.body.idAlloggio.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({
          success: false,
          message: "Id non conforme al formato MongoDB"
      });
      return;
  }

  // Se user loggato controlla se registrato ad alloggio specifico
  let prenotations = await HousingSubscription.findOne({idAlloggio: req.body.idAlloggio, idTurista: req.loggedUser.id});

  // Se non prenotato, invia un messaggio di errore
  if (!prenotations) {
  res.status(200).json({
      success: false,
      message: 'UserNotSubscribed'
      });
  return;
  }

  let house = await Housing.findOne({_id: req.body.idAlloggio});

    // Contollo data soggiorno passata
      var oggi = new Date();
      let dend = prenotations.dataFine;

      var diff = dend.getTime()  - oggi.getTime();
      //la data di fine evento è maggiore della data di oggi, evento deve ancora avvenire
      if (diff >= 0) {
        // Ritorna codice 401
        res.status(401).json({
            success: false,
            message: 'Soggiorno ancora non avvenuto'
        });
        return;
          };


  	// Crea la recensione per l'alloggio
  	let housingReview = new HousingReview({
        recensione: req.body.review,
        idAlloggio: req.body.idAlloggio,
        idUtente: req.loggedUser.id,
        idGestore: undefined,
        risposta: undefined
    });

  	// Aggiunge la recensione creata nel DB
  	housingReview = await housingReview.save();
  	res.status(200).json({
    		success: true,
    		message: 'Recensione alloggio creata correttamente!'
  	});
});

module.exports = router;
