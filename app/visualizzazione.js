const express = require('express');
const router = express.Router();
const Event = require('./models/event'); // get our mongoose model
const Category = require('./models/category'); // get our mongoose model
const User = require('./models/user'); // get our mongoose model





/**
 * @openapi
 * /api/v1/visualizzazione/eventList:
 *   get:
 *     description: Gets the list of all eventsList
 *     summary: View all events
 *     responses:
 *       200:
 *         description: Collection of events in JSON format
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: string that identifies the event
 *             title:
 *               type: string
 *               description: title of the event
 */
router.get('/eventList', async (req, res) => {
    let events = await Event.find().exec();
    let eventsList = events.map((eventItem) => {return{id:eventItem._id, title:eventItem.titolo};})
    res.status(200).json(eventsList);
});

/**
 * @openapi
 * /api/v1/visualizzazione/event:
 *   get:
 *     description: Gets the details of a specific event
 *     summary: Details of one events
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific event you want to get the details
 *     responses:
 *       200:
 *         description: Details of an event in JSON format
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               description: title of the event
 *             description:
 *               type: string
 *               description: description of the event
 *             initDate:
 *               type: string
 *               description: date of the beginning of the event in ISO8601 format
 *             finlDate:
 *               type: string
 *               description: date of the ending of the event in ISO8601 format
 *             address:
 *               type: string
 *               description: address of the event
 *             city:
 *               type: string
 *               description: city where the event takes place
 *             seatsAvailable:
 *               type: integer
 *               description: seats still available for the event
 *             seatsOccupied:
 *               type: number
 *               description: seats already occupied for the event
 *             category:
 *               type: number
 *               description: seats already occupied for the event
 *             creatorName:
 *               type: string
 *               description: the name of the user who created the event
 *             creatorSurname:
 *               type: string
 *               description: the surname of the user who created the event
 *             creatorEmail:
 *               type: string
 *               description: the email of the user who created the event
 *       404:
 *         description: Some data are not found on the DB
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             message:
 *               type: string
 *               description: specifications regarding the specific error
 *       400:
 *         description: The Id query parameter do not respect the MongoDB format
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             message:
 *               type: string
 *               description: specifications regarding the specific error
 */
router.get('/event', async (req, res) => {
    // Controlla che l'id rispetti il formato di MongoDB
    if (!req.query.id.match(/^[0-9a-fA-F]{24}$/)) {
      // Se non lo rispetta dichiara l'errore
      res.status(400).json({success: false, message: "Id non conforme al formato MongoDB"});
      return;
    }

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

    // Ritorna la risposta
    res.status(200).json(finalResponse);
});

module.exports = router;
