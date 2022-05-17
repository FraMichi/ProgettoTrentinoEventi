const express = require('express');
const router = express.Router();
const Event = require('./models/event'); // get our mongoose model
const Category = require('./models/category'); // get our mongoose model
const User = require('./models/user'); // get our mongoose model




/**
 * Resource representation based on the following the pattern:
 * https://cloud.google.com/blog/products/application-development/api-design-why-you-should-use-links-not-keys-to-represent-relationships-in-apis
 */
router.get('/eventList', async (req, res) => {
    let events = await Event.find().exec();
    let eventsList = events.map((eventItem) => {return{id:eventItem._id, title:eventItem.titolo};})
    res.status(200).json(eventsList);
});

router.get('/event', async (req, res) => {
    // Cerca nel DB l'evento specifico
    let eventItem = await Event.findOne({_id:req.query.id});

    // Se l'evento non viene trovato restituisci un errore
    if(!eventItem)
    {
        res.status(404).json({success: false, message: "Evento non trovato"});
        return;
    }

    // Trova gestore dell'evento
    let eventCategory = await Category.findOne({_id:eventItem.idCategoria});

    // Se la categoria non viene trovata restituisci un errore
    if(!eventCategory)
    {
        res.status(404).json({success: false, message: "Categoria non trovata"});
        return;
    }

    // Trova categoria dell'evento
    let eventCreator = await User.findOne({_id:eventItem.idGestore});

    // Se il gestore non viene trovato restituisci un errore
    if(!eventCreator)
    {
        res.status(404).json({success: false, message: "Gestore non trovato"});
        return;
    }


    // Risorsa finale
    let finalResponse = {
        title:eventItem.titolo,
        description:eventItem.descrizione,
        initDate: eventItem.dataInizio,
        finlDate: eventItem.dataFine,
        address: eventItem.indirizzo,
        city: eventItem.citta,
        seatsAvailable: eventItem.postiDisponibili,
        seatsOccupied: eventItem.postiTotali,
        category: eventCategory.tipoCategoria,
        creatorName: eventCreator.nome,
        creatorSurname: eventCreator.cognome,
        creatorEmail: eventCreator.email
    };

    console.log(finalResponse);

    // Ritorna la risposta
    res.status(200).json(finalResponse);
});

module.exports = router;
