const express = require('express');
const router = express.Router();
const Event = require('./../models/event');
const Category = require('./../models/category');



// Route per filtrare gli eventi
/**
 * @openapi
 * /api/v2/visualizzazioneFiltrata/getFilterEvents:
 *  delete:
 *   description: Resitituisce gli eventi che soddisfano i filtri applicati
 *   summary: Filtra gli eventi
 *   tags:
 *    - eventFiltering
 *   responses:
 *    200:
 *     description: non ci sono errori e gli eventi sono stati filtrati correttamente
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true dato che tutti i campi sono corretti
 *         eventsList:
 *          type: string
 *          description: Contiene la lista degli eventi filtrati
 *    400:
 *     description: Restituisce errore se il formato delle date non è corretto, il formato dell'id della categoria non rispetta quello di mongoDB e la data di inizio è maggiore di quella di fine
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale false ed indica che ci sono stati errori
 *         message:
 *          type: string
 *          description: Messaggio che contiene l'errore
 */
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

    res.status(200).json({success: true, eventsList: eventsList});
});

module.exports = router;
