const express = require('express');
const cookieParser = require("cookie-parser");
const tokenChecker = require("./tokenChecker.js");

const EventSubscription = require('./models/eventsubscription');
const Event = require('./models/event');

const router = express.Router();

/**
 * @openapi
 * /api/v1/eventSubscription/eventSubcribable:
 *   post:
 *     description: Check if the user is alreadi subscribed to the specific event
 *     summary: Check user subscription to event
 *     tags:
 *       - eventSubscription
 *     parameters:
 *       - in: body
 *         name: token
 *         type: string
 *         description: The token that rapresent the logged user
 *         required: true
 *       - in: body
 *         name: event
 *         type: string
 *         description: The id of the event
 *         required: true
 *     responses:
 *       200:
 *         description: Request successful
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     UserNotSubscribed => the user is not subscribed to the specific event
 *
 *                     UserSubscribed => the user is already subscribed to the specific event
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
router.post('/eventSubcribable', async (req, res) => {
    // verifica se utente loggato
    tokenChecker(req, res, req.body.token);

    // se utente non loggato (token decoded nella req = undefined)
    if(req.loggedUser == undefined)
    {
        // ritorna codice 401
        res.status(401).json({success:false,message:'UserNotLogged'});
        return;
    }

    // se user loggato controlla se già registrato ad evento specifico
    let iscrizione = await EventSubscription.findOne({idTurista:req.loggedUser.id, idEvento:req.body.event});

    //se non iscritto
    if(!iscrizione)
    {
        // segnala che l'utente non è iscritto
        res.status(200).json({success:true, message:'UserNotSubscribed'});
        return;
    }

    // altrimenti segnala che l'utente è iscritto
    res.status(200).json({success:true, message:'UserSubscribed'});
});

/**
 * @openapi
 * /api/v1/eventSubscription/createSubscription:
 *   post:
 *     description: Require to subscrive the user to the specific event
 *     summary: Subscribe the user to the event
 *     tags:
 *       - eventSubscription
 *     parameters:
 *       - in: body
 *         name: token
 *         type: string
 *         description: The token that rapresent the logged user
 *         required: true
 *       - in: body
 *         name: event
 *         type: string
 *         description: The id of the event to subscribe to
 *         required: true
 *     responses:
 *       200:
 *         description: The request was successful but it is not guaranteed that the new entry has been created, check the message field
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: |
 *                     NoFreeSeats => false
 *
 *                     UserAlreadySubscribed => true
 *                 message:
 *                   type: string
 *                   description: |
 *                     NoFreeSeats => the event has no free seats, the subscription has not been created
 *
 *                     UserAlreadySubscribed => the user is already subscribed to the specific event
 *       201:
 *         description: The request was successful and the new entry has been created
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: |
 *                     UserSubscribed => true
 *                 message:
 *                   type: string
 *                   description: |
 *                     UserSubscribed => the user has been subscribed to the event correctly and the new entry has been created
 *       401:
 *         description: The user is not logged
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: |
 *                     UserNotLogged => false
 *                 message:
 *                   type: string
 *                   description: |
 *                     UserNotLogged => the user has not provided a valid token, therefore the user is not logged
 */
router.post('/createSubscription', async (req, res) =>{
    // verifica se l'utente è loggato
    tokenChecker(req, res, req.body.token);
    if(req.loggedUser) {
        //se loggato controlla se già iscritto
        let iscrizione = await EventSubscription.findOne({idTurista:req.loggedUser.id, idEvento:req.body.event});
        if(iscrizione != null) {
            // segnala che l'utente è già iscritto
            res.status(200).json({success:true, message:'UserAlreadySubscribed'});
            return;
        }
        else {
            // se non iscritto, controlla se l'evento specifico ha posti disponibili
            let eventItem = await Event.findOne({_id:req.body.event});
            if(eventItem.postiDisponibili > 0)
            {
                // se ha posti disponibili, togline uno
                let tmp = eventItem.postiDisponibili - 1;

                // aggiorna il DB
                let doc = await Event.findOneAndUpdate({_id:req.body.event}, {postiDisponibili:tmp});

                // crea l'entry per l'iscrizione
                let newSubscription = new EventSubscription({
                    idEvento: req.body.event,
                    idTurista: req.loggedUser.id
                });

                // salva l'iscrizione
                newSubscription = await newSubscription.save();
                res.status(201).json({success:true, message:'UserSubscribed'});
                return;
            } else {
                // non ci sono posti disponibili
                res.status(200).json({success:false, message:'NoFreeSeats'});
            }
        }
    }
    else {
        //se non loggato ritorna 401
        res.status(401).json({success:false,message:'UserNotLogged'});
        return;
    }
});
module.exports = router;
