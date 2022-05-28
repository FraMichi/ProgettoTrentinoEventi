const express = require('express');
const router = express.Router();
const Event = require('./../models/event');
const Category = require('./../models/category');


router.get('/getFilterEvents', async (req, res) => {

    city = req.query.city;
    startDate = req.query.startDate;
    endDate = req.query.endDate;
    filterCategory = req.query.filterCategory;

    // Controlla che il formato della data sia coretto
    var date_regex = /^([1-9][0-9][0-9][0-9])\-(0[1-9]|1[0-2])\-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;
    if ((startDate)&&(!date_regex.test(startDate))) {
        // Se non lo rispetta ritorna un errore
		res.status(400).json({
            success: false,
            message: 'Formato data non corretto'
        });
		return;
  	}

    // Controlla che il formato della data sia coretto
    var date_regex = /^([1-9][0-9][0-9][0-9])\-(0[1-9]|1[0-2])\-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;
    if ((endDate)&&(!date_regex.test(endDate))) {
        // Se non lo rispetta ritorna un errore
		res.status(400).json({
            success: false,
            message: 'Formato data non corretto'
        });
		return;
  	}

    // Controlla se la data di inizio è maggiore di quella di fine
    if(startDate > endDate) {
        // Se si ritorna un errore
		res.status(400).json({
            success: false,
            message: 'La data iniziale deve essere minore di quella finale'
        });
		return;
    }

    // Controlla validita dell'id della categoria
    if ((filterCategory)&&(!filterCategory.match(/^[0-9a-fA-F]{24}$/))) {
        // Se non lo rispetta ritorna un errore
        res.status(400).json({
            success: false,
            message: "MongoDBFormatException"
        });
        return;
    }

    // Creo un dizionario
    let dict = {};

    // Inserisco nel dizionario l'elemento relativo alla città, se questa è stata inserita nei filtri
    if(city) {
        dict["citta"] = city;
    }

    // Inserisco nel dizionario l'elemento relativo alla data di inizio, se questa è stata inserita nei filtri
    if(startDate) {
        dict["dataInizio"] = { $gte: startDate };
    }

    // Inserisco nel dizionario l'elemento relativo alla data di fine, se questa è stata inserita nei filtri
    if(endDate) {
        dict["dataFine"] = { $lte: endDate };
    }

    // Inserisco nel dizionario l'elemento relativo alla categoria, se questa è stata inserita nei filtri
    if(filterCategory) {
        dict["idCategoria"] = filterCategory;
    }

    // Prendo dal DB tutti gli eventi applicando i filtri
    let events = await Event.find(dict).exec();

    // Creo la lista di eventi da ritornare, solo con id e titolo
    let eventsList = events.map((eventItem) => {return{id: eventItem._id, title: eventItem.titolo};})

    res.status(200).json({success: false, eventsList: eventsList});
});

module.exports = router;
