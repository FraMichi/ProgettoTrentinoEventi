const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Housing = require('./models/housing');
const User = require('./models/user');
const Event = require ('./models/event');
const Category = require ('./models/category');

// Route per creazione evento
/**
 * @openapi
 * /api/v1/event/create:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea il nuovo evento caricandolo nel DB
 *   summary: Crea un nuovo evento
 *   tags:
 *    - accommodation
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        name:
 *         type: string
 *         description: Contiene il nome dell'evento
 *        description:
 *         type: string
 *         description: Contiene la descrizione dell'evento
 *        dstart:
 *         type: date
 *         description: Contiene la data di inizio disponibilità dell'evento
 *        dend:
 *         type: data
 *         description: Contiene la data di fine disponibilità dell'evento
 *        address:
 *         type: string
 *         description: Contiene l'indirizzo dell'evento
 *        city:
 *         type: string
 *         description: Contiene la città in cui si trova l'evento
 *        total:
 *         type: number
 *         description: Contiene il numero di utenti totali che si possono iscrivere all'evento
 *        idCategoria:
 *         type: string
 *         description: Contiene l'id della categoria dell'evento
 *        idUser:
 *         type: string
 *         description: Contiene l'id del gestore che ha creato l'evento
 *   responses:
 *    200:
 *     description: sono stati controllati tutti i campi e non sono stati trovati errori, si procede con il caricamento dell'evento sul DB
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true dato che tutti i campi sono corretti
 *         message:
 *          type: string
 *          description: Messaggio che contiene un messaggio di successo
 *		400:
 *     description: Restituisce errore se non sono stati inseriti tutti i campi o se non sono corretti!
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
router.post('/create', async (req, res) => {

	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
	if (!req.body.name || !req.body.description || !req.body.dstart || !req.body.dend || !req.body.address || !req.body.city || !req.body.total || !req.body.idCategoria) {
		res.status(400).json({
			success: false,
			message: 'Inserire tutti i campi'
		});
		return;
	}

	// Controlla se la data di inizio e fine sono nel formato corretto, se no invia risposta con messaggio d'errore
  var date_regex = /^([1-9][0-9][0-9][0-9])\-(0[1-9]|1[0-2])\-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;
	if (!date_regex.test(req.body.dstart)) {
		res.status(400).json({
			success: false,
			message: 'Formato data non corretto'
		});
		return;
	}
	if (!date_regex.test(req.body.dend)) {
		res.status(400).json({
			success: false,
			message: 'Formato data non corretto'
		});
		return;
	}

	// Controlla se la data di inizio è prima della data di fine, se no invia risposta con messaggio d'errore
	if (req.body.dend < req.body.dstart) {
		res.status(400).json({
			success: false,
			message: 'La data di fine disponibilità e precedente alla data di inizio'
		});
		return;
	}

	// Crea il nuovo evento
	let evento = new Event({
		titolo: req.body.name,
	  descrizione: req.body.description,
	  dataInizio: req.body.dstart,
		dataFine: req.body.dend,
		indirizzo: req.body.address,
	  citta: req.body.city,
    postiDisponibili: req.body.total,
    postiTotali: req.body.total,
    idCategoria: req.body.idCategoria,
		idGestore: req.body.idUser,
    });

	// Aggiunge l'evento creato nel DB
	evento = await evento.save();
	res.status(200).json({
		success: true,
		message: 'Evento creato correttamente!'
	});
});

// Route per accesso alla lista di categoria
/**
 * @openapi
 * /api/v1/event/category:
 *  post:
 *   description: Controlla se le informazioni inserite nel form sono corrette e crea il nuovo evento caricandolo nel DB
 *   summary: Crea un nuovo evento
 *   tags:
 *    - eventCategory
 *   responses:
 *    200:
 *     description: Collezione di categorie in formato JSON
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         id:
 *          type: string
 *          description: id della categoria
 *         title:
 *          type: string
 *          description: nome della categoria
 */
router.get('/category', async (req, res) => {

    let categories = await Category.find().exec();
    let categoriesList = categories.map((category) => {return{id:category._id, title:category.tipoCategoria};})
    res.status(200).json(categoriesList);
});

module.exports = router;
