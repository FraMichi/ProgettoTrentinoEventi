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
 * /api/v2/visualizzazioneReview/eventReview:
 *   get:
 *     description: Gets the details of a specific event
 *     summary: Details of one event
 *     tags:
 *       - eventVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific event you want to get the details
 *         required: true
 *     responses:
 *       200:
 *         description: Details of an event in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 title:
 *                   type: string
 *                   description: title of the event
 *                 description:
 *                   type: string
 *                   description: description of the event
 *                 initDate:
 *                   type: string
 *                   description: date of the beginning of the event in ISO8601 format
 *                 finlDate:
 *                   type: string
 *                   description: date of the ending of the event in ISO8601 format
 *                 address:
 *                   type: string
 *                   description: address of the event
 *                 city:
 *                   type: string
 *                   description: city where the event takes place
 *                 seatsAvailable:
 *                   type: integer
 *                   description: seats still available for the event
 *                 seatsOccupied:
 *                   type: number
 *                   description: seats already occupied for the event
 *                 category:
 *                   type: string
 *                   description: the category of the event
 *                 creatorName:
 *                   type: string
 *                   description: the name of the user who created the event
 *                 creatorSurname:
 *                   type: string
 *                   description: the surname of the user who created the event
 *                 creatorEmail:
 *                   type: string
 *                   description: the email of the user who created the event
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

   // Trova recensioni legate all'evento
   let eventReview = await EventReview.find({idEvento: eventItem.idEvento});

   // Se la recensione non viene trovata restituisci un errore
   if(!eventReview) {
       res.status(404).json({
           success: false,
           message: "Recensioni non trovate"
       });
       return;
   }

   // Risorsa finale
   let finalResponse = {
       review: eventReview.review,
       answer: eventItem.answer,
   };

   // Ritorna la risposta
   res.status(200).json(finalResponse);
});

/**
 * @openapi
 * /api/v1/visualizzazione/housing:
 *   get:
 *     description: Gets the details of a specific housing
 *     summary: Details of one housing
 *     tags:
 *       - housingVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific housing you want to get the details
 *         required: true
 *     responses:
 *       200:
 *         description: Details of a housing in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 title:
 *                   type: string
 *                   description: title of the housing
 *                 description:
 *                   type: string
 *                   description: description of the housing
 *                 initDate:
 *                   type: string
 *                   description: date of the beginning of the housing availability slot in ISO8601 format
 *                 finlDate:
 *                   type: string
 *                   description: date of the ending of the housing availability slot in ISO8601 format
 *                 address:
 *                   type: string
 *                   description: address of the housing
 *                 city:
 *                   type: string
 *                   description: city where the housing is located
 *                 creatorName:
 *                   type: string
 *                   description: the name of the user who created the housing
 *                 creatorSurname:
 *                   type: string
 *                   description: the surname of the user who created the housing
 *                 creatorEmail:
 *                   type: string
 *                   description: the email of the user who created the housing
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

   // Trova recensioni legate all'alloggio
   let housingReview = await HousingReview.find({idAlloggio: housingItem.idAlloggio});

   // Se la recensione non viene trovata restituisci un errore
   if(!housingReview) {
       res.status(404).json({
           success: false,
           message: "Recensioni non trovate"
       });
       return;
   }

   // Risorsa finale
   let finalResponse = {
       review: housingItem.review,
       answer: housingItem.answer,
       };

   // Ritorna la risposta
   res.status(200).json(finalResponse);
});


module.exports = router;
