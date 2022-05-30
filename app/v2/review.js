const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Housing = require('./../models/housing');
const User = require('./../models/user');
const Event = require ('./../models/event');
const Category = require ('./../models/category');
const EventReview = require ('./../models/eventreview');
const HousingReview = require ('./../models/housigreview');

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
 *       401:
 *         description: The user is not logged
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     UserNotLogged => the user has not provided a valid token, therefore the user is not logged
 */
router.post('/createEventReview', async (req, res) => {

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

  // Se user loggato controlla se già registrato ad evento specifico
  let iscrizione = await EventSubscription.findOne({idTurista: req.loggedUser.id, idEvento: req.body.event});

  // Se non iscritto
  if(!iscrizione) {
      // Segnala che l'utente non è iscritto
      res.status(200).json({
          success: true,
          message: 'UserNotSubscribed'
      });
      return;
  }

  // Altrimenti segnala che l'utente è iscritto
  res.status(200).json({
      success: true,
      message: 'UserSubscribed'
  });

  	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  	if (!req.body.message || !req.body.answer || !req.body.event || !req.body.userId || !req.body.userId ) {
		res.status(400).json({
  			success: false,
  			message: 'Inserire tutti i campi'
		});
		return;
  	}

    //Controllo data evento sia passata
      var oggi = new Date();
      let dend = event[0].dataFine;

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
  	let eventreview = new EventReview({
        recensione: req.body.message,
        risposta: req.body.answer,
        idEvento: req.body.event,
        idUtente: req.body.userId,
        idGestore: req.body.userId,

    });

  	// Aggiunge la recensione creata nel DB
  	eventreview = await eventreview.save();
  	res.status(200).json({
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
 *     404:
 *     description: Restituisce errore se non è stato trovato l'alloggio
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
router.post('/createHousingReview', async (req, res) => {

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

  // Se user loggato controlla se registrato ad alloggio specifico
  let prenotations = await HousingSubscription.findOne({idAlloggio: req.body.housingId, idTurista: req.loggedUser.id});

  // Se non prenotato, invia un messaggio di errore
  if (!prenotations) {
  res.status(404).json({
      success: false,
      message: 'Utente non prenotato per l alloggio scelto'
      });
  return;
  }

  // Altrimenti segnala che l'utente è prenotato
  res.status(200).json({
      success: true,
      message: 'UserSubscribed'
  });

  	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  	if (!req.body.message || !req.body.answer || !req.body.housingId || !req.body.userId || !req.body.userId ) {
		res.status(400).json({
  			success: false,
  			message: 'Inserire tutti i campi'
		});
		return;
  	}

    // Contollo data soggiorno passata
      var oggi = new Date();
      let dend = house[0].dataFine;

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
  	let housingreview = new HousingReview({
        recensione: req.body.message,
        risposta: req.body.answer,
        idAlloggio: req.body.housingId,
        idUtente: req.body.userId,
        idGestore: req.body.userId,

    });

  	// Aggiunge la recensione creata nel DB
  	housingreview = await housingreview.save();
  	res.status(200).json({
    		success: true,
    		message: 'Recensione alloggio creata correttamente!'
  	});
});

// Route per eliminazione recensione evento
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

    // Prova a prendere la recensione dal database
  	let eventreview = await EventReview.findOne({ idUtente: req.loggedUser.id, idEvento: req.body.eventId }).exec();

  	// Controlla se la recensione esiste, se no invia un messaggio di errore
  	if (!eventreview) {
		res.status(404).json({
        success: false,
        message: 'Recensione evento non trovata'
        });
		return;
  	}

    // Controlla se l'utente è il creatore della recensione, se no invia un messaggio di errore
    if(eventreview.idUtente != req.loggedUser.id) {
        res.status(403).json({
        success: false,
        message: "Non sei il proprietario della recensione evento"
        });
		return;
    }

  	// Elimina la recensione evento dal DB
  	await EventReview.deleteOne({ idUtente: req.loggedUser.id, idEvento: req.body.eventId });

  	res.status(200).json({
    		success: true,
    		message: 'Recensione evento eliminata!'
  	});
});

// Route per eliminazione alloggio
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
  	let housingreview = await HousingReview.findOne({ idUtente: req.loggedUser.id, idAlloggio: req.body.housingId }).exec();

  	// Controlla se la recensione esiste, se no invia un messaggio di errore
  	if (!housingreview) {
		res.status(404).json({
        success: false,
        message: 'Recensione alloggio non trovata'
        });
		return;
  	}

    // Controlla se l'utente è il creatore della recensione, se no invia un messaggio di errore FARE
    if(alloggio.idUtente != req.loggedUser.id) {
        res.status(403).json({
        success: false,
        message: "Non sei il proprietario della recensione dell'alloggio"
        });
		return;
    }

  	// Elimina la recensione alloggio dal DB
  	await HousingReview.deleteOne({ idUtente: req.loggedUser.id, idAlloggio: req.body.housingId });

  	res.status(200).json({
    		success: true,
    		message: 'Recensione alloggio eliminata!'
  	});
});

/**
 * @openapi
 * /api/v2/review/eventReview:
 *   get:
 *     description: Gets the reviews of a specific event
 *     summary: Reviews of one event
 *     tags:
 *       - eventReviewsVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific event you want to get the details
 *         required: true
 *     responses:
 *       200:
 *         description: Reviews of an event in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 idUtente:
 *                   type: string
 *                   description: Id of the author of the review
 *                 message:
 *                   type: string
 *                   description: the review of the event
 *                 idGestore:
 *                   type: string
 *                   description: id of the creator of the event
 *                 answer:
 *                   type: string
 *                   description: the answer of the creator of the event
 *                 delete:
 *                   type: string
 *                   description: delete event review
 *       404:
 *         description: Some data are not found on the DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error
 *       400:
 *         description: The Id query parameter is not present or do not respect the MongoDB format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error
 */
router.get('/eventReview', async (req, res) => {

   // Controlla che sia effettivamente presente il parametro id
   if (!req.query.id) {
       // Se l'id non è presente nella query
       res.status(400).json({
           success: false,
           message: "Id non presente nella query"
       });
       return;
   }

   // Controlla che l'id rispetti il formato di MongoDB
   if (!req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
       // Se non lo rispetta dichiara l'errore
       res.status(400).json({
           success: false,
           message: "Id non conforme al formato MongoDB"
       });
       return;
   }

   // Cerca nel DB l'evento specifico
   let eventItem = await Event.findOne({_id: req.query.id});

   // Se l'evento non viene trovato restituisci un errore
   if(!eventItem) {
       res.status(404).json({
           success: false,
           message: "Evento non trovato"
       });
       return;
   }

   // Trova gestore dell'evento
   let eventCreator = await User.findOne({_id: eventItem.idGestore});

   // Se il gestore non viene trovato restituisci un errore
   if(!eventCreator) {
       res.status(404).json({
           success: false,
           message: "Gestore non trovato"
       });
       return;
   }

   // Prova a prendere la recensione dal database
   let eventreview = await EventReview.findOne({ idUtente: req.loggedUser.id, idEvento: req.body.eventId }).exec();

   // Controlla se la recensione esiste, se no invia un messaggio di errore
   if (!eventreview) {
   res.status(404).json({
       success: false,
       message: 'Recensione evento non trovata'
       });
   return;
   }

   // Controlla se l'utente è il creatore della recensione, se no invia un messaggio di errore
   if(eventreview.idUtente != req.loggedUser.id) {
       res.status(404).json({
       success: false,
       message: "Non sei il proprietario della recensione evento"
       });
   return;
   }

   // Risorsa finale
   let finalResponse = {
     recensione: eventreview.Messaggio,
     risposta: eventreview.Risposta,
     idUtente: eventreview.idUtente,
     idGestore: eventreview.idGestore
   };

   // Ritorna la risposta
   res.status(200).json(finalResponse);
});

/**
 * @openapi
 * /api/v2/review/housingReview:
 *   get:
 *     description: Gets the reviews of a specific housing
 *     summary: Reviews of one housing
 *     tags:
 *       - housingReviewVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific housing you want to get the reviews
 *         required: true
 *     responses:
 *       200:
 *         description: Details of a housing in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 review:
 *                   type: string
 *                   description: title of the housing
 *                 answer:
 *                   type: string
 *                   description: answer of the housing owner
 *                 idAlloggio:
 *                   type: string
 *                   description: id of the house
 *                 idUtente:
 *                   type: string
 *                   description: id of the user who write the review
 *                 idGestore:
 *                   type: string
 *                   description: id of the user who can answer
 *       404:
 *         description: Some data are not found on the DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error specific error
 *       400:
 *         description: The Id query parameter is not present or do not respect the MongoDB format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error
 */
router.get('/housingReview', async (req, res) => {

   // Controlla che sia effettivamente presente il parametro id
   if (!req.query.id) {
       // Se l'id non è presente nella query
       res.status(400).json({
           success: false,
           message: "Id non presente nella query"
       });
       return;
   }

   // Controlla che l'id rispetti il formato di MongoDB
   if (!req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
       // Se non lo rispetta dichiara l'errore
       res.status(400).json({
           success: false,
           message: "Id non conforme al formato MongoDB"
       });
       return;
   }

   // Cerca nel DB l'alloggio specifico
   let housingItem = await Housing.findOne({_id: req.query.id});

   // Se l'evento non viene trovato restituisci un errore
   if(!housingItem) {
       res.status(404).json({
           success: false,
           message: "Alloggio non trovato"
       });
       return;
   }

   // Trova creatore dell'evento
   let housingCreator = await User.findOne({_id: housingItem.idGestore});

   // Se il gestore non viene trovato restituisci un errore
   if(!housingCreator) {
       res.status(404).json({
           success: false,
           message: "Gestore non trovato"
       });
       return;
   }

   // Prova a prendere la recensione dal database
   let housingreview = await HousingReview.findOne({ idUtente: req.loggedUser.id, idAlloggio: req.body.housingId }).exec();

   // Controlla se la recensione esiste, se no invia un messaggio di errore
   if (!housingreview) {
   res.status(404).json({
       success: false,
       message: 'Recensione alloggio non trovata'
       });
   return;
   }

   // Risorsa finale
   let finalResponse = {
     recensione: housingreview.Messaggio,
     risposta: housingreview.Risposta,
     idUtente: housingreview.idUtente,
     idGestore: housingreview.idGestore
   };

   // Ritorna la risposta
   res.status(200).json(finalResponse);
});

// Route per creazione risposta recensione evento MODIFICARE SCHEMA
/**
 * @openapi
 * /api/v2/review/createEventAnswerReview:
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
 *       401:
 *         description: The user is not logged
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     UserNotLogged => the user has not provided a valid token, therefore the user is not logged
 */
router.post('/createEventReview', async (req, res) => {

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

  // Se user loggato controlla se già registrato ad evento specifico
  let iscrizione = await EventSubscription.findOne({idTurista: req.loggedUser.id, idEvento: req.body.event});

  // Se non iscritto
  if(!iscrizione) {
      // Segnala che l'utente non è iscritto
      res.status(200).json({
          success: true,
          message: 'UserNotSubscribed'
      });
      return;
  }

  // Altrimenti segnala che l'utente è iscritto
  res.status(200).json({
      success: true,
      message: 'UserSubscribed'
  });
//MODIFICARE CAMPI
  	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  	if (!req.body.message || !req.body.answer || !req.body.event || !req.body.userId || !req.body.userId ) {
		res.status(400).json({
  			success: false,
  			message: 'Inserire tutti i campi'
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

  	// Crea la risposta alla recensione evento
  	let eventanswerreview = new EventAnswerReview({
        risposta: req.body.answer,
        idGestore: req.body.userId,

    });

  	// Aggiunge la risposta alla recensione creata nel DB
  	eventanswerreview = await eventanswerreview.save();
  	res.status(200).json({
    		success: true,
    		message: 'Recensione evento creata correttamente!'
  	});
});

// Route per rispondere recensione alloggio MODIFICA SCHEMA
/**
 * @openapi
 * /api/v2/review/createHousingAnswerReview:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea una risposta ad una recensione ad un alloggio caricandola nel DB
 *   summary: Crea una risposta ad una recensione alloggio
 *   tags:
 *    - housingReviewAnswerCreation
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
 *     404:
 *     description: Restituisce errore se non è stato trovato l'alloggio
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
router.post('/createHousingAnswerReview', async (req, res) => {

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

  // Controlla se l'utente è il creatore dell'alloggio, se no invia un messaggio di errore
  if(alloggio.idGestore != req.loggedUser.id) {
      res.status(403).json({
      success: false,
      message: "Non sei il proprietario dell'alloggio"
      });
  return;
  }

//MODIFICARE CAMPI
  	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  	if (!req.body.message || !req.body.answer || !req.body.housingId || !req.body.userId || !req.body.userId ) {
		res.status(400).json({
  			success: false,
  			message: 'Inserire tutti i campi'
		});
		return;
  	}

  	// Crea la risposta alla recensione
  	let housinganswerreview = new HousingAnswerReview({
        risposta: req.body.answer,
        idGestore: req.body.userId,
    });
//MODIFICARE SALVATAGGIO
  	// Aggiunge la risposta creata nel DB
  	housingreview = await housingreview.save();
  	res.status(200).json({
    		success: true,
    		message: 'Recensione alloggio creata correttamente!'
  	});
});

module.exports = router;
