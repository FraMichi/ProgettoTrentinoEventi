const express = require('express');
const cookieParser = require("cookie-parser");
const tokenChecker = require("./../tokenChecker.js");

const EventSubscription = require('./../models/eventsubscription');
const Event = require('./../models/event');

const router = express.Router();

/**
 * @openapi
 * /api/v1/eventSubscription/eventSubcribable:
 *   post:
 *     description: Controlla se l'utente è iscritto ad un evento specifico
 *     summary: Controlla l'iscrizione di un utente ad un evento
 *     tags:
 *       - eventSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente loggato
 *                 required: true
 *               event:
 *                 type: string
 *                 description: Id dell'evento
 *                 required: true
 *     responses:
 *       200:
 *         description: Richiesta completata con successo
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     UserNotSubscribed => l'utente non è iscritto all'evento
 *
 *                     UserSubscribed => l'utente è già iscritto all'evento
 *       401:
 *         description: L'utente non è loggato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     UserNotLogged => il token fornito non è valido
 *       404:
 *         description: L'evento richiesto non è stato trovato nel DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     EventNotFound => l'evento specifico non esiste nel DB
 *       400:
 *         description: L'id specificato non rispetta il formato mongoDB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     MongoDBFormatException => l'id specificato non rispetta il formato mongoDB
 */
router.post('/eventSubcribable', async (req, res) => {

    // Verifica se utente loggato
    tokenChecker(req, res, req.body.token);

    // RESPO_DONE 400 MongoDBFormatException
    // Verifica che id rispetti formato MongoDB
    if (!req.body.event.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({success: false, message: "MongoDBFormatException"});
      return;
    }

    // Se utente non loggato (token decoded nella req = undefined)
    if(req.loggedUser == undefined) {
        // Ritorna codice 401
        res.status(401).json({
            success: false,
            message: 'UserNotLogged'
        });
        return;
    }

    // Se user loggato controlla se l'evento specifico esiste
    let eventExists = await Event.find({_id:req.body.event});
    if(eventExists.length == 0){
        // RESPO_DONE 404 EventNotFound
        res.status(404).json({success: false, message: "EventNotFound"});
        return;
    }

    // Se l'evento esiste
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
});

/**
 * @openapi
 * /api/v1/eventSubscription/createSubscription:
 *   post:
 *     description: Effettua l'iscrizione dell'utente all'evento specifico
 *     summary: Iscrizione utente a evento
 *     tags:
 *       - eventSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente
 *                 required: true
 *               event:
 *                 type: string
 *                 description: Id dell'evento
 *                 required: true
 *     responses:
 *       200:
 *         description: Richiesta completata con successo, ma non è stata creata una nuova entry nel DB
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
 *
 *                     TimeExceeded => true
 *                 message:
 *                   type: string
 *                   description: |
 *                     NoFreeSeats => l'evento non ha posti liberi, iscrizione annullata
 *
 *                     UserAlreadySubscribed => l'utente è già iscritto all'evento
 *
 *                     TimeExceeded => l'evento a cui vuoi iscriverti è già finito
 *       201:
 *         description: Richiesta completata con successo, nuova entry creata nel DB
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
 *                     UserSubscribed => l'utente è stato iscritto all'evento
 *       401:
 *         description: L'utente non è loggato
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
 *                     UserNotLogged => il token fornito non è valido
 *       404:
 *         description: L'evento richiesto non è stato trovato nel DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     EventNotFound => l'evento specifico non esiste nel DB
 *       400:
 *         description: L'id specificato non rispetta il formato mongoDB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: |
 *                     MongoDBFormatException => l'id specificato non rispetta il formato mongoDB
 */
router.post('/createSubscription', async (req, res) =>{

    // Verifica se l'utente è loggato
    tokenChecker(req, res, req.body.token);

    // RESPO_DONE 400 MongoDBFormatException
    // Verifica che id rispetti formato MongoDB
    if (!req.body.event.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({success: false, message: "MongoDBFormatException"});
      return;
    }


    if(req.loggedUser) {
        // Se user loggato controlla se l'evento specifico esiste
        let eventExists = await Event.find({_id:req.body.event});
        if(eventExists.length == 0){
            // RESPO_DONE 404 EventNotFound
            res.status(404).json({success: false, message: "EventNotFound"});
            return;
        }

        // Se se l'evento esiste, controlla se user già iscritto
        let iscrizione = await EventSubscription.findOne({idTurista: req.loggedUser.id, idEvento: req.body.event});
        if(iscrizione != null) {
            // Segnala che l'utente è già iscritto
            res.status(200).json({
                success: true,
                message: 'UserAlreadySubscribed'
            });
            return;
        } else {
            // Se non iscritto, controlla se l'evento specifico ha posti disponibili
            let eventItem = await Event.findOne({_id: req.body.event});

            if(!(new Date(eventItem.dataFine).getTime() > new Date().getTime()))
            {
                // RESPO_DONE 200 TimeExceeded
                res.status(200).json({
                    success: false,
                    message: 'TimeExceeded'
                });
                return;
            }

            if(eventItem.postiDisponibili > 0) {
                // Se ha posti disponibili, togline uno
                let tmp = eventItem.postiDisponibili - 1;

                // Aggiorna il DB
                let doc = await Event.findOneAndUpdate({_id: req.body.event}, {postiDisponibili: tmp});

                // Crea l'entry per l'iscrizione
                let newSubscription = new EventSubscription({
                    idEvento: req.body.event,
                    idTurista: req.loggedUser.id
                });

                // Salva l'iscrizione
                //newSubscription = await newSubscription.save();
                newSubscription = await EventSubscription.create(newSubscription);
                res.status(201).json({
                    success: true,
                    message: 'UserSubscribed'
                });
                return;
            } else {
                // Non ci sono posti disponibili
                res.status(200).json({
                    success: false,
                    message: 'NoFreeSeats'
                });
            }
        }
    }
    else {
        // Se non loggato ritorna 401
        res.status(401).json({
            success: false,
            message: 'UserNotLogged'
        });
        return;
    }
});


module.exports = router;
