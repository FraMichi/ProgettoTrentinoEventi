const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('./../models/user');

// Route per login
/**
 * @openapi
 * /api/v1/authentication/login:
 *  post:
 *   description: Controlla se l utente esiste e in caso affermativo fa il login
 *   summary: Fa il login se l utente esiste
 *   tags:
 *    - authentication
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        email:
 *         type: string
 *         description: Indirizzo email dell utente
 *        password:
 *         type: string
 *         description: Password dell utente
 *   responses:
 *    200:
 *     description: Utente esiste, aggiunge il token, la sua data di scadenza, il nome dell utente e l id alla response o password errata restituisce messaggio
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true se non ci sono stati errori, false se la password è sbagliata
 *         message:
 *          type: string
 *          description: Messaggio che contiene info specifiche
 *         token:
 *          type: string
 *          description: Token criptato che contiene info relative all'utente
 *         name:
 *          type: string
 *          description: Nome utente
 *         id:
 *          type: string
 *          description: Id utente
 *         expireTime:
 *          type: number
 *          description: Tempo di validità del token espresso in secondi
 *    400:
 *     description: Restituisce errore se non sono stati inseriti tutti i campi!
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale false
 *         message:
 *          type: string
 *          description: Messaggio che contiene l'errore
 *    404:
 *     description: Restituisce errore utente non trovato!
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
router.post('/login', async (req, res) => {

  	// Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  	if (!req.body.email || !req.body.password) {
    	  res.status(400).json({
            success: false,
            message: 'Inserire tutti i campi'
        });
    		return;
  	}

  	// Cerca utente nel DB
  	let user = await User.findOne({"email": req.body.email.toString().toLowerCase()});

  	// Se l'utente non è stato trovato invia risposta con messaggio d'errore
  	if (!user) {
    		res.status(404).json({
            success: false,
            message: 'Utente non trovato'
        });
    		return;
  	}

  	// Se la password non è corretta invia risposta con messaggio d'errore
  	if (user.password != req.body.password) {
    		res.status(200).json({
            success: false,
            message: 'Password sbagliata',
            token: null,
            name: null,
            id: null,
            expireTime: null
        });
    		return;
  	}

  	// Creazione token
  	var payload = {
      	name: user.nome,
      	surname: user.cognome,
      	birthdate: user.dataDiNascita,
        email: req.body.email.toString().toLowerCase(),
      	userType: user.tipoDiUtente,
      	id: user._id
  	}

    // Scadenza dopo 30 minuti
    expire = 1800;
  	var options = {
  		  expiresIn: expire
  	}

  	var token = jwt.sign(payload, process.env.TOKEN_SECRET, options);

    // Restituisce messaggio di successo contente token, nome ed id dell'utente e scadenza del token
    res.status(200).json({
      	success: true,
        message: 'Login effettuato',
        token: token,
        name: user.nome,
        id: user._id,
        expireTime: expire
  	});
});

// Route per registrazione
/**
 * @openapi
 * /api/v1/authentication/subscribe:
 *  post:
 *   description: Controlla se l utente esiste e in caso non affermativo lo iscrive, aggiunge il cookie contentente il token, il nome dell utente e l id alla response
 *   summary: Fa la registazione se l utente non esiste
 *   tags:
 *    - authentication
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        name:
 *         type: string
 *         description: Nome dell utente
 *        surname:
 *         type: string
 *         description: Cognome dell utente
 *        birthdate:
 *         type: string
 *         description: Data di nascita dell utente
 *        userType:
 *         type: string
 *         description: Tipo di utente
 *        email:
 *         type: string
 *         description: Indirizzo email dell utente
 *        password:
 *         type: string
 *         description: Password di utente
 *   responses:
 *    201:
 *     description: Registrazione avvenuta correttamente
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true se non ci sono stati errori, false se la password è sbagliata
 *         token:
 *          type: string
 *          description: Token criptato che contiene info relative all'utente
 *         name:
 *          type: string
 *          description: Nome utente
 *         id:
 *          type: string
 *          description: Id utente
 *         expireTime:
 *          type: number
 *          description: Tempo di validità del token espresso in secondi
 *    400:
 *     description: Restituisce errori in caso di campi non inseriti, formato data o email non corretto, o tipo di utente non corretto
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale false
 *         message:
 *          type: string
 *          description: Messaggio che contiene l'errore
 *    404:
 *     description: Restituisce errore utente gia esistente!
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
router.post('/subscribe', async (req, res) => {

    // Controlla se sono stati inseriti tutti i campi nel form, se no invia risposta con messaggio d'errore
  	if (!req.body.name || !req.body.surname || !req.body.birthdate || !req.body.email || !req.body.password || !req.body.userType) {
    		res.status(400).json({
            success: false,
            message: 'Inserire tutti i campi'
        });
    		return;
  	}

    // Controlla se la data è nel formato corretto, se no invia risposta con messaggio d'errore
    var date_regex = /^([1-9][0-9][0-9][0-9])\-(0[1-9]|1[0-2])\-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/;
    if (!date_regex.test(req.body.birthdate)) {
    		res.status(400).json({
            success: false,
            message: 'Formato data non corretto'
        });
    		return;
  	}

    // Controlla se la email è nel formato corretto, se no invia risposta con messaggio d'errore
    var email_regex = /^(([a-z0-9])([a-z0-9]*)\.{0,1}([a-z0-9])([a-z0-9]*)@([a-z][a-z]*)\.[a-z]{2,3})$/;
  	if (!email_regex.test(req.body.email.toString().toLowerCase())) {
    		res.status(400).json({
            success: false,
            message: 'Formato email non corretto'
        });
    		return;
  	}

    // Controlla se il tipo di utente è valido (gestore o turista), se no invia risposta con messaggio d'errore
  	if (req.body.userType != 'turista' && req.body.userType != 'gestore') {
    		res.status(400).json({
            success: false,
            message: 'Il tipo di utente non è disponibile'
        });
    		return;
  	}

    // Controlla se l'utente è già esistente nel DB
  	let userDB = await User.findOne({"email": req.body.email.toString().toLowerCase()});

  	// Se l'utente è stato trovato invia risposta con messaggio d'errore
  	if (userDB) {
    		res.status(404).json({
            success: false,
            message: 'Utente già esistente'
        });
    		return;
  	}

  	// Se l'utente non è stato trovato, lo crea
    let user = new User({
        nome: req.body.name,
        cognome: req.body.surname,
        dataDiNascita: req.body.birthdate,
        email: req.body.email.toString().toLowerCase(),
        password: req.body.password,
        tipoDiUtente: req.body.userType
    });

  	// Aggiunge l'utente creato nel DB
  	user = await User.create(user);

  	// Creazione token
  	var payload = {
    		name: user.nome,
    		surname: user.cognome,
    		birthdate: user.dataDiNascita,
    		email: req.body.email.toString().toLowerCase(),
    		userType: user.tipoDiUtente,
    		id: user._id
  	}
    expire = 1800; // Scadenza dopo 30 minuti

  	var options = {
    		expiresIn: expire
  	}

  	var token = jwt.sign(payload, process.env.TOKEN_SECRET, options);

    // Restituisce messaggio di successo contente token, nome ed id dell'utente e scadenza del token
    res.status(201).json({
      	success: true,
        token: token,
        name: user.nome,
        id: user._id,
        expireTime: expire
  	});
});

// Route per controllare se utente è loggato
/**
 * @openapi
 * /api/v1/authentication/checkIfLogged:
 *  post:
 *   description: Controlla se l utente e gia loggato
 *   summary: Controlla se utente loggato
 *   tags:
 *    - authentication
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        token:
 *         type: string
 *         description: Contiene il token
 *   responses:
 *    200:
 *     description: Utente gia loggato
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true ed indica che non ci sono stati errori
 *         message:
 *          type: string
 *          description: Messaggio che contiene un messaggio di successo
 *    404:
 *     description: Restituisce errori cookie non trovato e token non valido
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
router.post('/checkIfLogged', async (req, res) => {

    // Prende il token dal body della request
  	token = req.body.token;

  	// Verifica il token ed invia una risposta in base al risultato
  	jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {

    		if (err) {
      			// Se il token non è valido manda un messaggio di errore
      			res.status(404).json({
        				success: false,
        				message: 'Token non valido'
      			});
    		} else {
      			// Se il token è valido manda un messaggio di validità e il nome dell'utente
      			res.status(200).json({
        				success: true,
        				message: 'Token valido'
      			});
    		}
  	});
});

// Route per checkIfGestore
/**
 * @openapi
 * /api/v1/authentication/checkIfGestore:
 *  post:
 *   description: Controlla se l utente e un gestore per permettere la creazione di eventi e alloggi
 *   summary: Controlla se utente gestore
 *   tags:
 *    - authentication
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       properties:
 *        token:
 *         type: string
 *         description: Contiene il token
 *   responses:
 *    200:
 *     description: è stato controllato che l'utente è un gestore e quindi si può proseguire con la creazione dell'evento/alloggio
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true dato che l'utente è un gestore
 *         message:
 *          type: string
 *          description: Messaggio che contiene un messaggio di successo
 *         category:
 *          type: string
 *          description: Contiene la categoria dell'utente
 *    404:
 *     description: Restituisce errore utente turista!
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
router.post('/checkIfGestore', async (req, res) => {

    // Prende l'idUser dal body della request
    userId = req.body.userId;

    // Cerca nel DB l'utente specifico
    let utente = await User.findOne({_id: userId});

    // Controlla che l'utente esista
    if(!utente) {
        res.status(404).json({
            success: false,
            message: "Utente non trovato"
        });
    } else {
        // Trova categoria dell'utente
        let userType = utente.tipoDiUtente;

        // Verifica che l'utente sia un gestore
        if(userType == 'gestore'){
            res.status(200).json({
                success: true,
                message: "L'utente è un gestore",
                category: "gestore"
            });
        } else {
            res.status(200).json({
                success: false,
                message: "L'utente è un turista",
                category: "turista"
            });
        }
    }
});


module.exports = router;
