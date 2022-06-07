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
 *     description: Gets the reviews of a specific event
 *     summary: Reviews of one event
 *     tags:
 *       - eventReviewVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific event you want to get the review
 *         required: true
 *     responses:
 *       200:
 *         description: Review of an event in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 reviewId:
 *                   type: string
 *                   description: id della review
 *                 recensione:
 *                   type: string
 *                   description: recensione dell'evento
 *                 risposta:
 *                   type: string
 *                   description: risposta alla recensione
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

   // Trova recensioni legate all'evento
   let eventReview = await EventReview.find({idEvento: req.query.id});

   // Se la recensione non viene trovata restituisci un errore
   if(!eventReview) {
       res.status(404).json({
           success: false,
           message: "Recensioni non trovate"
       });
       return;
   }

   // Risorsa finale
   let reviewList = eventReview.map((review) => {return{ reviewId: review._id , recensione: review.recensione, risposta: review.risposta};})

   res.status(200).json(reviewList);

});

/**
 * @openapi
 * /api/v2/visualizzazioneReview/housingReview:
 *   get:
 *     description: Gets the reviews of a specific housing
 *     summary: Reviews of one housing
 *     tags:
 *       - housingReviewVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific housing you want to get the review
 *         required: true
 *     responses:
 *       200:
 *         description: Review of a housing in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 reviewId:
 *                   type: string
 *                   description: id della review
 *                 recensione:
 *                   type: string
 *                   description: recensione dell'evento
 *                 risposta:
 *                   type: string
 *                   description: risposta alla recensione
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

   // Trova recensioni legate all'alloggio
   let housingReview = await HousingReview.find({idAlloggio: req.query.id});

   // Se la recensione non viene trovata restituisci un errore
   if(!housingReview) {
       res.status(404).json({
           success: false,
           message: "Recensioni non trovate"
       });
       return;
   }

   // Risorsa finale
   let reviewList = housingReview.map((review) => {return{reviewId: review._id, recensione: review.recensione, risposta: review.risposta};})

   res.status(200).json(reviewList);
});


module.exports = router;
