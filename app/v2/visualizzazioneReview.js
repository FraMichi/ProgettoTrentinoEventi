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

  let eventReview = await EventReview.find().exec();
  let eventReviewList = eventReview.map((eventReview) => {return{review: review, answer: answer};})
  res.status(200).json(eventReviewList);
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

module.exports = router;
