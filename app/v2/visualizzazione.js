const express = require('express');
const cookieParser = require("cookie-parser");
const tokenChecker = require("./../tokenChecker.js");

const HousingSubscription = require('./../models/housingsubscription');
const Housing = require('./../models/housing');
const EventSubscription = require('./../models/eventsubscription');
const Event = require('./../models/event');
const User = require('./../models/user');

const router = express.Router();

/**
 * @openapi
 * /api/v2/visualizzazione/houseList:
 *   post:
 *     description: Elenca tutti gli alloggi a cui l utente si e iscritto
 *     summary: Lista di alloggi prenotati
 *     tags:
 *       - visualizzazioneSubHouseList
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
 *         description: Risultato ottenuto, la risposta contiene una lista degli alloggi prenotati in formato JSON
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
router.post('/houseList', async (req, res) => {

    // Verifica se utente loggato
    tokenChecker(req, res, req.body.token);

    // Se utente non loggato (token decoded nella req = undefined)
    if(req.loggedUser == undefined) {
        // Ritorna codice 401
        res.status(401).json({
            success: false,
            message: 'Utente non loggato'
        });
        return;
    }

    // Se utente loggato, prende la lista di tutti gli alloggi ai quali è scritto
    let houses = await HousingSubscription.find({idTurista: req.loggedUser.id}).exec();

    // Se non è iscritto a nessun alloggio scrive un messaggio sulla pagina
    if (Object.keys(houses).length == 0) {
        res.status(200).json({
            success: false,
            message: 'Non hai prenotato nessun alloggio'
        });
        return;
    }
    let housesList = houses.map((houseItem) => {return{idAlloggio: houseItem.idAlloggio};});
    res.status(200).json(housesList);
});


/**
 * @openapi
 * /api/v2/visualizzazione/eventList:
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
router.post('/eventList', async (req, res) => {

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

    // Se utente loggato, prende la lista di tutti gli eventi ai quali è scritto
    let events = await EventSubscription.find({idTurista: req.loggedUser.id}).exec();

    // Se non è iscritto a nessun evento scrive un messaggio sulla pagina
    if (Object.keys(events).length == 0) {
        res.status(200).json({
            success: false,
            message: 'Non sei iscritto/a a nessun evento'
        });
        return;
    }
    let eventsList = events.map((eventItem) => {return{idEvento: eventItem.idEvento};});
    res.status(200).json(eventsList);
});

router.post('/eventSubscription', async (req, res) => {

    // Verifica se utente loggato
    tokenChecker(req, res, req.body.token);

    // Se utente non loggato (token decoded nella req = undefined)
    if(req.loggedUser == undefined) {
        // Ritorna codice 401
        res.status(401).json({
            success: false,
            message: 'Utente non loggato'
        });
        return;
    }

    //Se l'utente non è il proprietario dell'evento
    let evento = await Event.findOne({_id: req.body.eventId}).exec()
    if (req.body.userId != evento.idGestore) {
        // Ritorna codice 401
        res.status(400).json({
            success: false,
            message: 'Utente non proprietario dell\'evento'
        });
        return;
    }

    // Se utente loggato e proprietario dell'evento, prende la lista di tutti gli utenti iscritti all'evento
    let subscribers = await EventSubscription.find({idEvento: req.body.eventId}).exec();

    // Se non si è iscritto scrive un messaggio sulla pagina
    if (Object.keys(subscribers).length == 0) {
        res.status(200).json({
            success: false,
            message: 'Nessun utente si è iscritto a questo evento'
        });
        return;
    }
    let subList = subscribers.map(async (subItem) => {
        userSubscribed = await User.findOne({_id: subItem.idTurista}).exec();
        return{nome: userSubscribed.nome, cognome: userSubscribed.cognome, dataDiNascita: userSubscribed.dataDiNascita, email: userSubscribed.email};
    });
    console.log(subList);
    res.status(200).json(subList);
});

module.exports = router;
