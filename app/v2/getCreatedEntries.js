const express = require('express');
const router = express.Router();

const tokenChecker = require("./../tokenChecker.js");

// Modelli Mongoose
const Event = require('./../models/event');
const Category = require('./../models/category');
const User = require('./../models/user');
const Housing = require('./../models/housing');

// Dato il token del gestore, ritorna la lista di tutti gli eventi caricati
router.post('/getCreatedEvents', async (req, res) => {
    // Controlla validità token
    // PARAM: token
    tokenChecker(req, res, req.body.token);
    if(req.loggedUser == undefined){
        // RESPO: 401 TokenNotValid
        res.status(401).json({success: false, message: "TokenNotValid"});
        return;
    }

    // Controlla che utente sia gestore
    if (req.loggedUser.userType != "gestore"){
        // RESPO: 403 BadUserType
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
    // RESPO: 200 {id: eventItem._id, title: eventItem.titolo, descr: eventItem.descrizione, init: eventItem.dataInizio, finl: eventItem.dataFine, addrs: eventItem.indirizzo, seats: eventItem.postiDisponibili, allSt: eventItem.postiTotali, categ: catList[eventItem.idCategoria]}
    res.status(200).json(eventsList);
});

// Dato il token del gestore, ritorna la lista di tutti gli alloggi caricati
router.get('/getCreatedHousings', async (req, res) => {

});
module.exports = router;
