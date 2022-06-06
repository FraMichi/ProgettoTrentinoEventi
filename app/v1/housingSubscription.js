const express = require('express');
const cookieParser = require("cookie-parser");
const tokenChecker = require("./../tokenChecker.js");

const HousingSubscription = require('./../models/housingsubscription');
const Housing = require('./../models/housing');

const router = express.Router();

/**
 * @openapi
 * /api/v1/housingSubscription/getHousingSlots:
 *   post:
 *     description: Ottieni la lista delle iscrizioni ad un alloggio specifico
 *     summary: Lista iscrizione alloggi
 *     tags:
 *       - housingSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente
 *               id:
 *                 type: string
 *                 description: L'id dell'alloggio specifico
 *     responses:
 *       200:
 *         description: Richiesta completata con successo, la risposta contiene una lista di iscrizioni che rispettano il seguente formato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 init:
 *                   type: Date
 *                   description: Data iniziale dello slot nel formato ISO8601
 *                 finl:
 *                   type: Date
 *                   description: Data finale dello slot nel formato ISO8601
 *                 free:
 *                   type: boolean
 *                   description: |
 *                     true => slot libero
 *
 *                     false => slot occupato
 *                 ofUser:
 *                   type: boolean
 *                   description: |
 *                     true => lo slot è prenotato dall'utente identificato dal token fornito
 *
 *                     false => slot occupato ad un altro utente (ignora se "free = true")
 *       400:
 *         description: La richiesta presenta problemi, controlla il codice ritornato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: the value is always false
 *                 message:
 *                   type: string
 *                   description: |
 *                     MongoDBFormatException => l'id specificato non rispetta il formato mongoDB
 *
 *                     MissingHousing => nella richiesta non è stato specificato l'ID di un evento
 *       404:
 *         description: Alloggio specificato non presente nel DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: sempre false
 *                 message:
 *                   type: string
 *                   description: HousingNotFound
 */
router.post('/getHousingSlots', async (req, res) =>{
    /*
        Data inizio INCLUSA
        Data fine ESCLUSA
     */

     // Controlla se id evento presente
     if(req.body.id == undefined)
     {
         res.status(400).json({success: false, message: "MissingHousing"});
         return;
     }

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
    let house = await Housing.find({_id:housId});
    if(house.length == 0){
        res.status(404).json({success: false, message: "HousingNotFound"});
        return;
    }

    let tmpInitDate = house[0].dataInizio;   // Data iniziale
    let tmpFinlDate = house[0].dataFine;     // Data finale

    // Inizializza lista degli slot
    let slotList = [{init: null, finl: tmpInitDate, free: false}];

    // Inserisci slot da controllare
    slotList.push("###-MARK-###");

    // Ottieni la lista di prenotazioni per l'alloggio specifico
    let prenotations = await HousingSubscription.find({idAlloggio:housId})

    prenotations.sort((a, b) =>{
        let tmpA = a.dataInizio.getTime();
        let tmpB = b.dataInizio.getTime();
        if(tmpA < tmpB) {
            return -1;
        }
        else if (tmpA > tmpB) {
            return 1;
        }
        else {
            return 0;
        }
    });

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
                slotList[i] = {init: slotList[i-1].finl, finl: slotList[i+1].init, free: true, ofUser: false};
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
    res.status(200).json(slotList);
});


/**
 * @openapi
 * /api/v1/housingSubscription/subscribeHousing:
 *   post:
 *     description: Richiedi di creare un iscizione ad un alloggio specifico
 *     summary: Iscrivi utente ad alloggio
 *     tags:
 *       - housingSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token che rappresenta l'utente
 *               id:
 *                 type: string
 *                 description: Id alloggio
 *               initDate:
 *                 type: string
 *                 description: Data iniziale slot (inclusa)
 *               finlDate:
 *                 type: string
 *                 description: Data finale slot (esclusa)
 *     responses:
 *       200:
 *         description: Richiesta completata con successo, ma la nuova risorsa non è stata creata. Controlla il codice ritornato per ulteriori informazioni
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 succes:
 *                   type: boolean
 *                   description: sempre false
 *                 message:
 *                   type: string
 *                   description: |
 *                     BadDateOrder => la data iniziale supera quella finale
 *
 *                     BadDateOffset => lo slot richiesto esce dalla disponibilita dell'alloggio
 *
 *                     DateSlotOverlap => lo slot richiesto si sovrappone con uno già esistente
 *       400:
 *         description: La richiesta presenta problemi, controlla il codice ritornato
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: always false
 *                 message:
 *                   type: string
 *                   description: |
 *                     MongoDBFormatException => l'id specificato non rispetta il formato mongoDB
 *
 *                     MissingParameters => nella richiesta mancano dei parametri fondamentali
 *       404:
 *         description: L'alloggio specifico non è stato trovato nel DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: sempre false
 *                 message:
 *                   type: string
 *                   description: HousingNotFound
 *       401:
 *         description: Il token fornito non è valido
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: sempre false
 *                 message:
 *                   type: string
 *                   description: TokenNotValid
 *       201:
 *         description: La prenotazione è stata creata correttamente
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: sempre true
 *                 message:
 *                   type: string
 *                   description: UserSubscribed
 */
router.post('/subscribeHousing', async (req, res) =>{
    /*
        Data inizio INCLUSA
        Data fine ESCLUSA
     */

     // Controlla se id evento presente
     if(req.body.housingId == undefined || req.body.initDate == undefined || req.body.finlDate == undefined)
     {
         res.status(400).json({success: false, message: "MissingParameters"});
         return;
     }

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
        res.status(401).json({success: false, message: "TokenNotValid"});
        return;
    }

    // Controlla se l'alloggio esiste
    let house = await Housing.findOne({_id:housingId});
    if(house.length == 0){
        res.status(404).json({success: false, message: "HousingNotFound"});
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

    //newSubscription = await newSubscription.save();
    newSubscription = await HousingSubscription.create(newSubscription);
    res.status(201).json({success:true, message:'UserSubscribed'});
});


module.exports = router;
