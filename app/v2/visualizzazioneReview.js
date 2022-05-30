const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Housing = require('./../models/housing');
const User = require('./../models/user');
const Event = require ('./../models/event');
const Category = require ('./../models/category');
const EventReview = require ('./../models/eventreview');
const HousingReview = require ('./../models/housingreview');


/**
 * @openapi
 * /api/v2/visualizzazione/eventListSubscribed:
 *   post:
 *     description: Elenca tutti gli eventi a cui l utente si e iscritto
 *     summary: Lista di eventi prenotati
 *     tags:
 *       - visualizzazioneSubEventList
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente loggato
 *     responses:
 *       200:
 *         description: Risultato ottenuto, la risposta contiene una lista degli eventi prenotati in formato JSON
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: |
 *                     true => la lista è piena, ci sono prenotazioni
 *
 *                     false => la lista è vuota, non ci sono prenotazioni
 *       401:
 *         description: L'utente non è autenticato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: vale sempre false
 *                 message:
 *                   type: string
 *                   description: Messaggio che contiene l'errore
 */
router.post('/eventReview', async (req, res) => {
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

  // se utente loggato, prende tutte le recensioni disponibili per quell'Evento
  let review = await EventReview.find({idEvento: eventId}).exec();

   //Crea un array che andrò a riempire con le recensioni eventi
   var eventReviewList = [];
   // Per ogni recensione presa dagli eventi controllo se effettivamente esiste
   for(var i in review){
       eventreview = await EventReview.findOne({idEvento: review[i].idEvento}).exec();
       if (eventreview != null)
           eventReviewList.push({review: review[i].review, answer: review[i].answer});
   }
   // Se non è presente nessuna recensione
   if (eventReviewList.length == 0) {
       res.status(200).json({
           success: false,
           message: 'Non ci sono recensioni evento disponibili'
       });
       return;
   }
   res.status(200).json(eventReviewList);
});


/**
 * @openapi
 * /api/v2/visualizzazione/eventListSubscribed:
 *   post:
 *     description: Elenca tutti gli eventi a cui l utente si e iscritto
 *     summary: Lista di eventi prenotati
 *     tags:
 *       - visualizzazioneSubEventList
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente loggato
 *     responses:
 *       200:
 *         description: Risultato ottenuto, la risposta contiene una lista degli eventi prenotati in formato JSON
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: |
 *                     true => la lista è piena, ci sono prenotazioni
 *
 *                     false => la lista è vuota, non ci sono prenotazioni
 *       401:
 *         description: L'utente non è autenticato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: vale sempre false
 *                 message:
 *                   type: string
 *                   description: Messaggio che contiene l'errore
 */
router.get('/housingReview', async (req, res) => {
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

  // se utente loggato, prende tutte le recensioni disponibili per quell'Evento
  let review = await HousingReview.find({idAlloggio: housingId}).exec();

   //Crea un array che andrò a riempire con le recensioni eventi
   var housingReviewList = [];
   // Per ogni recensione presa dagli eventi controllo se effettivamente esiste
   for(var i in review){
       housingreview = await HousingReview.findOne({idAlloggio: review[i].idAlloggio}).exec();
       if (housingreview != null)
           housingReviewList.push({review: review[i].review, answer: review[i].answer});
   }
   // Se non è presente nessuna recensione
   if (housingReviewList.length == 0) {
       res.status(200).json({
           success: false,
           message: 'Non ci sono recensioni alloggio disponibili'
       });
       return;
   }
   res.status(200).json(housingReviewList);

});

module.exports = router;
