const express = require('express');
const cookieParser = require("cookie-parser");
const tokenChecker = require("./tokenChecker.js");

const EventSubscription = require('./models/eventsubscription');

const router = express.Router();

/**
 * @openapi
 * /api/v1/visualizzazione/eventList:
 *   get:
 *     description: Gets the list of all events
 *     summary: View all events
 *     tags:
 *       - eventVisualization
 *     responses:
 *       200:
 *         description: Collection of events in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: string
 *                   description: string that identifies the event
 *                 title:
 *                   type: string
 *                   description: title of the event
 */
router.get('/eventSubcribable', async (req, res, next) => {
    // verifica se utente loggato
    tokenChecker(req, res, next);

    // se utente non loggato (token decoded nella req = undefined)
    if(req.loggedUser == undefined)
    {
        // ritorna codice 401
        res.status(401).json({success:false,message:'User not logged'});
        return;
    }

    // se user loggato controlla se già registrato ad evento specifico
    console.log(req.loggedUser.id);
    console.log(req.query.id);
    let iscrizione = await EventSubscription.findOne({idTurista:req.loggedUser.id, idEvento:req.query.id});

    //se non iscritto
    if(!iscrizione)
    {
        // segnala che l'utente è iscritto
        res.status(200).json({success:true, message:'UserNotSubscribed'});
        return;
    }

    // altrimenti segnala che l'utente non è iscritto
    res.status(200).json({success:true, message:'UserSubscribed'});
 });

module.exports = router;
