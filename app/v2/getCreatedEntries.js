const express = require('express');
const router = express.Router();

const tokenChecker = require("./../tokenChecker.js");

// Modelli Mongoose
const Event = require('./../models/event');
const Category = require('./../models/category');
const User = require('./../models/user');
const Housing = require('./../models/housing');


/**
 * @openapi
 * /api/v2/getCreatedEntries/getCreatedEvents:
 *   post:
 *     description: Dato il token del gestore ritorna la lista di tutti gli eventi caricati, solo gli utenti di tipo gestore possono visualizzare gli eventi che hanno caricato
 *     summary: Ottieni lista eventi caricati
 *     tags:
 *       - getCreatedEntries
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
 *         description: Viene restituita una lista in formato JSON degli eventi creati dal gestore specifico. Ogni oggetto rispetta il seguente formato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Id dell'evento
 *                 title:
 *                   type: string
 *                   description: Titolo dell'evento
 *                 descr:
 *                   type: string
 *                   description: Descrizione dell'evento
 *                 init:
 *                   type: string
 *                   description: Data di inizio dell'evento
 *                 finl:
 *                   type: string
 *                   description: Data di fine dell'evento
 *                 addrs:
 *                   type: string
 *                   description: Indirizzo dell'evento
 *                 seats:
 *                   type: number
 *                   description: Numero di posti ancora disponibili
 *                 allSt:
 *                   type: number
 *                   description: Numero di posti totali
 *                 categ:
 *                   type: string
 *                   description: Categoria dell'evento
 *       401:
 *         description: Il token fornito non è valido
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Sempre false
 *                 message:
 *                   type: string
 *                   description: TokenNotValid
 *       403:
 *         description: Il token fornito rappresenta un utente NON gestore
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Sempre false
 *                 message:
 *                   type: string
 *                   description: BadUserType
 */
router.post('/getCreatedEvents', async (req, res) => {
    // Controlla validità token
    // PARAM_DONE: token
    tokenChecker(req, res, req.body.token);
    if(req.loggedUser == undefined){
        // RESPO_DONE: 401 TokenNotValid
        res.status(401).json({success: false, message: "TokenNotValid"});
        return;
    }

    // Controlla che utente sia gestore
    if (req.loggedUser.userType != "gestore"){
        // RESPO_DONE: 403 BadUserType
        res.status(403).json({success: false, message: "BadUserType"});
        return;
    }

    // Prepara lista categorie
    let cat = await Category.find();
    let catList = [];
    cat.forEach((item) => {
        catList[item._id] = item.tipoCategoria;
    });

    // Ricerca nel DB tutti gli eventi relativi al gestore
    let events = await Event.find({idGestore: req.loggedUser.id}).exec();
    let eventsList = events.map((eventItem) => {
        return{id: eventItem._id, title: eventItem.titolo, descr: eventItem.descrizione, init: eventItem.dataInizio, finl: eventItem.dataFine, addrs: eventItem.indirizzo, seats: eventItem.postiDisponibili, allSt: eventItem.postiTotali, categ: catList[eventItem.idCategoria]}
    });
    // RESPO_DONE: 200 {id: eventItem._id, title: eventItem.titolo, descr: eventItem.descrizione, init: eventItem.dataInizio, finl: eventItem.dataFine, addrs: eventItem.indirizzo, seats: eventItem.postiDisponibili, allSt: eventItem.postiTotali, categ: catList[eventItem.idCategoria]}
    res.status(200).json(eventsList);
});

/**
 * @openapi
 * /api/v2/getCreatedEntries/getCreatedHousings:
 *   post:
 *     description: Dato il token del gestore, ritorna la lista di tutti gli alloggi caricati, solo gli utenti di tipo gestore possono visualizzare gli alloggi che hanno caricato
 *     summary: Ottieni lista alloggi caricati
 *     tags:
 *       - getCreatedEntries
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
 *         description: Viene restituita una lista in formato JSON degli eventi creati dal gestore specifico. Ogni oggetto rispetta il seguente formato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Id dell'alloggio
 *                 title:
 *                   type: string
 *                   description: Titolo dell'alloggio
 *                 descr:
 *                   type: string
 *                   description: Descrizione dell'alloggio
 *                 init:
 *                   type: string
 *                   description: Data di inizio disponibilità dell'alloggio
 *                 finl:
 *                   type: string
 *                   description: Data di fine disponibilità dell'alloggio
 *                 addrs:
 *                   type: string
 *                   description: Indirizzo dell'alloggio
 *                 city:
 *                   type: string
 *                   description: Città dove si trova l'alloggio
 *       401:
 *         description: Il token fornito non è valido
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Sempre false
 *                 message:
 *                   type: string
 *                   description: TokenNotValid
 *       403:
 *         description: Il token fornito rappresenta un utente NON gestore
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Sempre false
 *                 message:
 *                   type: string
 *                   description: BadUserType
 */
router.post('/getCreatedHousings', async (req, res) => {
    // Controlla validità token
    // PARAM_DONE: token
    tokenChecker(req, res, req.body.token);
    if(req.loggedUser == undefined){
        // RESPO_DONE: 401 TokenNotValid
        res.status(401).json({success: false, message: "TokenNotValid"});
        return;
    }

    // Controlla che utente sia gestore
    if (req.loggedUser.userType != "gestore"){
        // RESPO_DONE: 403 BadUserType
        res.status(403).json({success: false, message: "BadUserType"});
        return;
    }

    // Ricerca nel DB tutti gli eventi relativi al gestore
    let events = await Housing.find({idGestore: req.loggedUser.id}).exec();
    let eventsList = events.map((eventItem) => {
        return{id: eventItem._id, title: eventItem.titolo, descr: eventItem.descrizione, init: eventItem.dataInizio, finl: eventItem.dataFine, addrs: eventItem.indirizzo, city: eventItem.citta}
    });
    // RESPO_DONE: 200 {id: eventItem._id, title: eventItem.titolo, descr: eventItem.descrizione, init: eventItem.dataInizio, finl: eventItem.dataFine, addrs: eventItem.indirizzo, city: eventItem.citta}
    res.status(200).json(eventsList);
});
module.exports = router;
