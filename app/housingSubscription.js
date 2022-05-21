const express = require('express');
const cookieParser = require("cookie-parser");
const tokenChecker = require("./tokenChecker.js");

const HousingSubscription = require('./models/housingsubscription');
const Housing = require('./models/housing');

const router = express.Router();

router.post('/getHousingSlots', async (req, res) =>{
    /*
        Data inizio INCLUSA
        Data fine ESCLUSA
     */

    // Id alloggio
    let housId = req.body.id;

    // Token
    let token = req.body.token;

    // Controlla validita token
    tokenChecker(req, res, token);

    // Cerca le date di disponibilità dell'alloggio specifico
    let house = await Housing.findOne({idAlloggio:housId});
    let tmpInitDate = new Date(Date.parse(house.dataInizio));   // Data iniziale
    let tmpFinlDate = new Date(Date.parse(house.dataFine));     // Data finale

    // Inizializza lista degli slot
    let slotList = [{init: null, finl: new Date(tmpInitDate.getFullYear(), tmpInitDate.getMonth(), tmpInitDate.getDate()), free: false}];

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
        slotList.push({init: new Date(tmpDateInit.getFullYear(), tmpDateInit.getMonth(), tmpDateInit.getDate()), finl: new Date(tmpDateFinl.getFullYear(), tmpDateFinl.getMonth(), tmpDateFinl.getDate()), free: false, ofUser: user});

        // Inserisci elemento di controllo
        slotList.push("###-MARK-###");
    });

    // Inserisci l'ultimo elemento nella lista di slot
    slotList.push({init: new Date(tmpFinlDate.getFullYear(), tmpFinlDate.getMonth(), tmpFinlDate.getDate()), finl: null, free: false});

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

module.exports = router;
