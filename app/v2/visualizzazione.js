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
 * /api/v2/visualizzazione/houseListSubscribed:
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
router.post('/houseListSubscribed', async (req, res) => {

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

    //Crea un array che andrò a riempire con gli eventi
    var houseList = [];
    // Per ogni evento preso dalle prenotazioni controllo se effettivamente esiste nella lista degli eventi
    for(var i in houses){
        houseItem = await Housing.findOne({_id: houses[i].idAlloggio}).exec();
        if (houseItem != null)
            houseList.push({idAlloggio: houses[i].idAlloggio});
    }
    // Se non è iscritto a nessun evento presente nel db scrive un messaggio sulla pagina
    if (houseList.length == 0) {
        res.status(200).json({
            success: false,
            message: 'Non hai prenotato nessun alloggio'
        });
        return;
    }
    res.status(200).json(houseList);
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
router.post('/eventListSubscribed', async (req, res) => {

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

    // Se utente loggato, prende la lista di tutti gli eventi ai quali è scritto
    let events = await EventSubscription.find({idTurista: req.loggedUser.id});

    //Crea un array che andrò a riempire con gli eventi
    var eventList = [];
    // Per ogni evento preso dalle prenotazioni controllo se effettivamente esiste nella lista degli eventi
    for(var i in events){
        eventItem = await Event.findOne({_id: events[i].idEvento});
        if (eventItem != null) {
            eventList.push({idEvento: events[i].idEvento});
        }
    }
    // Se non è iscritto a nessun evento presente nel db scrive un messaggio sulla pagina
    if (eventList.length == 0) {
        res.status(200).json({
            success: false,
            message: 'Non sei iscritto/a a nessun evento'
        });
        return;
    }
    res.status(200).json(eventList);

});

/**
 * @openapi
 * /api/v2/visualizzazione/eventSubscription:
 *   post:
 *     description: Elenca tutti gli utenti iscritti a uno specifico evento
 *     summary: Lista di utenti iscritti
 *     tags:
 *       - visualizzazioneIscrittiEventi
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente loggato
 *               userId:
 *                 type: string
 *                 description: Id dell'utente loggato
 *               eventId:
 *                 type: string
 *                 description: Id dell'evento richiesto
 *     responses:
 *       200:
 *         description: Risultato ottenuto, la risposta contiene una lista degli utenti iscritti
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: |
 *                     true => la lista è piena, ci sono utenti iscritti
 *
 *                     false => la lista è vuota, non ci sono utenti iscritti
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
 *       400:
 *         description: eventId mancante o in formato sbagliato, oppure, utente loggato non proprietario dell'evento
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
 *       404:
 *         description: eventId non presente nel DB
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

    // Se eventId non presente nella query
    if(req.body.eventId == undefined) {
        // Ritorna codice 401
        res.status(400).json({
            success: false,
            message: 'EventId non presente nella query'
        });
        return;
    }

    // Se eventId in un formato sbagliato
    if (!req.body.eventId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({
          success: false,
          message: "EventId in formato sbagliato"
      });
      return;
    }

    // Cerca nel DB l'evento specifico
    let eventItem = await Event.findOne({_id: req.body.eventId});

    // Se l'evento non viene trovato restituisci un errore
    if(!eventItem) {
        res.status(404).json({
            success: false,
            message: "Evento non trovato"
        });
        return;
    }

    //Se utente non gestisce l'evento
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

    // Se non si è iscritto nessuno scrive un messaggio sulla pagina
    if (Object.keys(subscribers).length == 0) {
        res.status(200).json({
            success: false,
            message: 'Nessun utente si è iscritto a questo evento'
        });
        return;
    }

    //Crea un array che andrò a riempire con i dati degli utenti iscritti
    var subList = [];

    // Per ogni user in subscribers cerca i dati corrispondenti e li inserisce
    for(var i in subscribers){
        userSubscribed = await User.findOne({_id: subscribers[i].idTurista}).exec();
        subList.push({nome: userSubscribed.nome, cognome: userSubscribed.cognome, dataDiNascita: userSubscribed.dataDiNascita, email: userSubscribed.email});
    }
    res.status(200).json(subList);
});

/**
 * @openapi
 * /api/v2/visualizzazione/housingSubscription:
 *   post:
 *     description: Elenca tutti gli utenti che hanno prenotato un alloggio specifico
 *     summary: Lista di utenti con prenotazione
 *     tags:
 *       - visualizzazioneIscrittiAlloggi
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente loggato
 *               userId:
 *                 type: string
 *                 description: Id dell'utente loggato
 *               eventId:
 *                 type: string
 *                 description: Id dell'evento richiesto
 *     responses:
 *       200:
 *         description: Risultato ottenuto, la risposta contiene una lista degli utenti iscritti
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: |
 *                     true => la lista è piena, ci sono utenti iscritti
 *
 *                     false => la lista è vuota, non ci sono utenti iscritti
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
 *       400:
 *         description: housingId mancante o in formato sbagliato, oppure, utente loggato non proprietario dell'alloggio
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
 *       404:
 *         description: housingId non presente nel DB
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
router.post('/housingSubscription', async (req, res) => {

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

    // Se housingId non presente nella query
    if(req.body.housingId == undefined) {
        // Ritorna codice 401
        res.status(400).json({
            success: false,
            message: 'HousingId non presente nella query'
        });
        return;
    }

    // se housingId di un formato sbagliato
    if (!req.body.housingId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({success: false, message: "HousingId in formato sbagliato"});
      return;
    }

    // Cerca nel DB l'alloggio specifico
    let houseItem = await Housing.findOne({_id: req.body.housingId});

    // Se l'alloggio non viene trovato restituisci un errore
    if(!houseItem) {
        res.status(404).json({
            success: false,
            message: "Alloggio non trovato"
        });
        return;
    }

    //Se utente non gestisce l'alloggio
    let house = await Housing.findOne({_id: req.body.housingId}).exec()
    if (req.body.userId != house.idGestore) {
        // Ritorna codice 401
        res.status(400).json({
            success: false,
            message: 'Utente non proprietario dell\'alloggio'
        });
        return;
    }
    let tmpInitDate = house.dataInizio;   // Data iniziale
    let tmpFinlDate = house.dataFine;     // Data finale

    // Inizializza lista degli slot
    let subList = [{init: null, finl: tmpInitDate, sub: false}];

    // Inserisci slot da controllare
    subList.push("###-MARK-###");

    // Ottieni la lista di prenotazioni per l'alloggio specifico
    let subscribers = await HousingSubscription.find({idAlloggio: req.body.housingId}).sort({dataInizio:1});

    // Se non si è iscritto nessuno scrive un messaggio sulla pagina
    if (Object.keys(subscribers).length == 0) {
        res.status(200).json({
            success: false,
            message: 'Nessun utente ha prenotato questo alloggio'
        });
        return;
    }

    // Per ogni user in subscribers cerca i dati corrispondenti e li inserisce
    for(var i in subscribers){
        //Ottiene i dati dell'utente
        userSubscribed = await User.findOne({_id: subscribers[i].idTurista}).exec();
        // Ottieni i limiti della prenotazione
        let tmpDateInit = new Date(Date.parse(subscribers[i].dataInizio));    // Data iniziale
        let tmpDateFinl = new Date(Date.parse(subscribers[i].dataFine));      // Data finale
        // Inserisci lo slot prenotato nella lista degli slot
        subList.push({init: tmpDateInit, finl: tmpDateFinl, nome: userSubscribed.nome, cognome: userSubscribed.cognome, dataDiNascita: userSubscribed.dataDiNascita, email: userSubscribed.email, sub: true});

        // Inserisci elemento di controllo
        subList.push("###-MARK-###");
    }

    // Inserisci l'ultimo elemento nella lista di slot
    subList.push({init: tmpFinlDate, finl: null, sub: false});

    // Per ogni "elemento da controllare" nella lista degli slot
    subList.forEach((item, i) => {
        if(item == '###-MARK-###')
        {
            // Se la data finale dell'elemento precedente corrisponde a quella iniziale dell'elemento successivo
            if(subList[i-1].finl.getTime() === subList[i+1].init.getTime()) {
                // Allora non c'è nessuno slot libero tra i 2 slot
                subList[i] = null;
            } else {
                // Altrimenti c'è uno slot libero tra i 2 slot
                subList[i] = {init: subList[i-1].finl, finl: subList[i+1].init, sub: false};
            }
        }
    });

    // Togli il primo elemento (che non serve)
    subList.shift();
    // Toglio l'ultimo elemento (che non serve)
    subList.pop();
    // Togli tutti i null (che non servono)
    subList=subList.filter(n=>n);
    res.status(200).json(subList);
});

module.exports = router;
