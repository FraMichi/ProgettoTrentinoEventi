const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const tokenChecker = require("./../tokenChecker.js");

const User = require('./../models/user');
const Event = require ('./../models/event');
const Housing = require ('./../models/housing');
const EventSubscription = require ('./../models/eventsubscription');
const HousingSubscription = require ('./../models/housingsubscription');
const Review = require ('./../models/review');

// Route per creazione recensione
/**
 * @openapi
 * /api/v2/reviews/create:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea una recensione caricandola nel DB
 *   summary: Crea una nuova recensione
 *   tags:
 *    - reviewCreation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        name:
 *         type: string
 *         description: contiene il nome dell'utente
 *        surname:
 *         type: string
 *         description: Contiene il cognome dell'utente
 *        email:
 *         type: string
 *         description: contiene l'email dell'utente
 *        message:
 *         type: string
 *         description: Contiene la recensione
 *   responses:
 *    200:
 *     description: sono stati controllati tutti i campi e non sono stati trovati errori, si procede con il caricamento della recensione sul DB
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
router.post('/create', async (req, res) => {

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

     // Controlla validita dell'id dell'alloggio
     if (!req.body.housingId.match(/^[0-9a-fA-F]{24}$/)) {
         // Se non lo rispetta ritorna un errore
         res.status(400).json({
             success: false,
             message: "MongoDBFormatException"
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

     // Se user loggato controlla se registrato ad alloggio specifico
     let prenotations = await HousingSubscription.findOne({idAlloggio: housingId, idTurista: req.loggedUser.id, dataInizio: initDate.toISOString(), dataFine: finlDate.toISOString()});

     // Se non prenotato, invia un messaggio di errore
     if (!prenotations) {
 		res.status(404).json({
         success: false,
         message: 'Utente non prenotato per l alloggio scelto'
         });
 		return;
   	}

    // Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  	if (!req.body.name || !req.body.surname || !req.body.email || !req.message) {
		res.status(400).json({
  			success: false,
  			message: 'Inserire tutti i campi'
		});
		return;
  	}

  	// Controlla che l'evento sia passato
    //controllare che alloggio sia passato

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
  			message: 'La data di fine disponibilità e precedente alla data di inizio'
		});
		return;
  	}

  	// Crea la nuova recensione
  	let recensione = new review({
        Nome: req.body.name,
        Cognome: req.body.surname,
        Email: req.body.email,
        Messaggio: req.body.message,
    });

  	// Aggiunge la reensione creata nel DB
  	recensione = await review.save();
  	res.status(200).json({
    		success: true,
    		message: 'Recensione creata correttamente!'
  	});
});

module.exports = router;
