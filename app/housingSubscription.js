const express = require('express');
const cookieParser = require("cookie-parser");
const tokenChecker = require("./tokenChecker.js");

const HousingSubscription = require('./models/housingsubscription');
const Housing = require('./models/housing');

const router = express.Router();

/**
 * @openapi
 * /api/v1/housingSubscription/getHousingSlots:
 *   post:
 *     description: List all the subscription slots of a given housing
 *     summary: List housing subscription slots
 *     tags:
 *       - housingSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: The token that rapresent the logged user
 *               id:
 *                 type: string
 *                 description: The id of the specific housing
 *     responses:
 *       200:
 *         description: Request successful, the response contains a collection of subscription slot in the following JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 init:
 *                   type: string
 *                   description: Initial date of the specific prenotation slot
 *                 finl:
 *                   type: string
 *                   description: Final date of the spacific prenotation slot
 *                 free:
 *                   type: boolean
 *                   description: |
 *                     true => the specific slot is free
 *
 *                     false => the specific slot is already occupied, therefore is not subscribable
 *                 ofUser:
 *                   type: boolean
 *                   description: |
 *                     true => the specific slot is already taken by the user identified by the token provided
 *
 *                     false => the specific slot is already occupied, but not by the user identified by the token provided
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
router.post('/getHousingSlots', async (req, res) =>{
    /*
        Data inizio INCLUSA
        Data fine ESCLUSA
     */

    // Id alloggio
    let housId = req.body.id;
    // Token
    let token = req.body.token;

    // Controlla validita Id fornito
    if (!housId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({success: false, message: "MongoDBFormatException"});
      return;
    }

    // Controlla validita token
    tokenChecker(req, res, token);

    // Cerca le date di disponibilità dell'alloggio specifico
    let house = await Housing.findOne({idAlloggio:housId});
    if(!house){
        res.status(404).json(JSON.stringify({success: false, message: "HousingNotFound"}));
        return;
    }


    let tmpInitDate = house.dataInizio;   // Data iniziale

    let tmpFinlDate = house.dataFine;     // Data finale

    // Inizializza lista degli slot
    let slotList = [{init: null, finl: tmpInitDate, free: false}];

    // Inserisci slot da controllare
    slotList.push("###-MARK-###");

    // Ottieni la lista di prenotazioni per l'alloggio specifico
    let prenotations = await HousingSubscription.find({idAlloggio:housId}).sort({dataInizio:1});
    let dateMap = new Map(Object.entries(prenotations));

    // Per ogni entry di prenotazione
    dateMap.forEach((item, i) => {
        // Ottieni i limiti
        let tmpDateInit = new Date(Date.parse(item.dataInizio));    // Data iniziale
        let tmpDateFinl = new Date(Date.parse(item.dataFine));      // Data finale

        // Controlla se la prenotazione è stata effettuata dall'utente loggato
        let user;
        if(req.loggedUser == undefined) {
            // Se non loggato, imposta false di default
            user = false;
        } else {
            // Altrimenti esegui il controllo
            user = (req.loggedUser.id == item.idTurista);
        }

        // Inserisci lo slot prenotato nella lista degli slot
        slotList.push({init: tmpDateInit, finl: tmpDateFinl, free: false, ofUser: user});

        // Inserisci elemento di controllo
        slotList.push("###-MARK-###");
    });

    // Inserisci l'ultimo elemento nella lista di slot
    slotList.push({init: tmpFinlDate, finl: null, free: false});

    // Per ogni "elemento da controllare" nella lista degli slot
    slotList.forEach((item, i) => {
        if(item == '###-MARK-###')
        {
            // Se la data finale dell'elemento precedente corrisponde a quella iniziale dell'elemento successivo
            if(slotList[i-1].finl.getTime() === slotList[i+1].init.getTime()) {
                // Allora non c'è nessuno slot libero tra i 2 slot
                slotList[i] = null;
            } else {
                // Altrimenti c'è uno slot libero tra i 2 slot
                slotList[i] = {init: slotList[i-1].finl, finl: slotList[i+1].init, free: true};
            }
        }
    });

    // Togli il primo elemento (che non serve)
    slotList.shift();
    // Toglio l'ultimo elemento (che non serve)
    slotList.pop();
    // Togli tutti i null (che non servono)
    slotList=slotList.filter(n=>n);

    // Restituisci l'output JSON
    res.status(200).json(JSON.stringify(slotList));
});

router.post('/subscribeHousing', async (req, res) =>{
    /*
        Data inizio INCLUSA
        Data fine ESCLUSA
     */

    let initDate = new Date(req.body.initDate);
    let finlDate = new Date(req.body.finlDate);
    let housingId = req.body.housingId;
    let token = req.body.token;

    // Controlla che la data iniziale sia effettivamente precedente alla data finale
    if(!(initDate < finlDate))
    {
        res.status(200).json({success: false, message: "BadDateOrder"});
        return;
    }

    // Controlla validita Id fornito
    if (!housingId.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({success: false, message: "MongoDBFormatException"});
      return;
    }

    // Controlla validità token
    tokenChecker(req, res, token);
    if(req.loggedUser == undefined){
        res.status(401).json(JSON.stringify({success: false, message: "TokenNotValid"}));
        return;
    }

    // Controlla se l'alloggio esiste
    let house = await Housing.findOne({idAlloggio:housingId});
    if(!house){
        res.status(404).json(JSON.stringify({success: false, message: "HousingNotFound"}));
        return;
    }

    // Controlla che le date fornite siano coerenti con quelle dell'alloggio
    let housingInitDate = new Date(house.dataInizio);
    let housingFinlDate = new Date(house.dataFine);

    if(!((housingInitDate.getTime() <= initDate.getTime() && initDate.getTime() < housingFinlDate.getTime()) && (housingInitDate.getTime() <= finlDate.getTime() && finlDate.getTime() <= housingFinlDate.getTime()))){
        res.status(200).json({success: false, message: "BadDateOffset"});
        return;
    }

    // Controlla se esistono già delle prenotazioni che iniziano o finiscono nel periodo specificato nella richiesta
    let prenotations = await HousingSubscription.find({idAlloggio: housingId});

    for(i in prenotations)
    {
        // Ottieni le date dello slot già prenotato
        let dataIniziale = new Date(prenotations[i].dataInizio).getTime();
        let dataFinale = new Date(prenotations[i].dataFine).getTime();

        // Metti a confronto le date
        if((initDate.getTime() <= dataIniziale && dataIniziale < finlDate.getTime())||(initDate.getTime() < dataFinale && dataFinale < finlDate.getTime()))
        {
            // Se c'è una sovrapposizione, invalida la richiesta
            res.status(200).json({success: false, message: "DateSlotOverlap"});
            return;
        }
    }

    // Se tutt i controlli sono soddisfatti, crea la prenotazione
    let newSubscription = new HousingSubscription({
        idAlloggio: housingId,
        idTurista: req.loggedUser.id,
    	dataInizio: initDate.toISOString(),
    	dataFine: finlDate.toISOString()
    });

    newSubscription = await newSubscription.save();
    res.status(201).json({success:true, message:'UserSubscribed'});
});

module.exports = router;
