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
 *       - in: query
 *         name: userToken
 *         type: string
 *         description: The token that rapresent the logged user
 *         required: true
 *       - in: query
 *         name: eventId
 *         type: string
 *         description: The id of the event to check the registration for
 *         required: true
 *     responses:
 *       401:
 *         description: The token provided is not valid
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
 *                     UserSubscribed => the user is already subscribed to the specific event)
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
 *  post:
 *   description: Update the DB in order to create the subscription to the specific event
 *   summary: Create the subscription
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        email:
 *         type: string
 *         description: Indirizzo email dell utente
 *        password:
 *         type: string
 *         description: Password dell utente
 *   responses:
 *    200:
 *     description: Utente esiste e campi inseriti corretti, aggiunge il cookie contentente il token, il nome dell utente e l id alla response
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true ed indica che non ci sono stati errori
 *    404:
 *     description: Restituisce errori utente non trovato o password sbagliata!
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
