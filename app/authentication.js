const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('./models/user');

// Route per login
/**
 * @openapi
 * /api/v1/authentication/login:
 *  post:
 *   description: Controlla se l utente esiste e in caso affermativo fa il login
 *   summary: Fa il login se l utente esiste
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
 *     description: Utente esiste e campi inseriti corretti
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true ed indica che non ci sono stati errori
 *    404:
 *     description: Restituisce errori utente non trovato o password sbagliata!
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

	// Cerca utente nel DB
	let user = await User.findOne({"email" : req.body.email.toString()}).exec();

	// Se l'utente non è stato trovato invia risposta con messaggio d'errore
	if (!user) {
		res.status(404).json({ success: false, message: 'Utente non trovato' });
		return;
	}

	// Se la password non è corretta invia risposta con messaggio d'errore
	if (user.password != req.body.password) {
		res.status(404).json({ success: false, message: 'Password sbagliata' });
		return;
	}


	// Creazione token

	var payload = {
		name: user.nome,
	    surname: user.cognome,
	    birthdate: user.dataDiNascita,
		email: user.email,
		password: user.password,
	    userType: user.tipoDiUtente,
		email: user.email,
		id: user.id
	}

	var options = {
		expiresIn: 120 // Scadenza dopo 2 minuti
	}

	var token = jwt.sign(payload, process.env.TOKEN_SECRET, options);


	// Creazione cookie contenente dati dell'utente tra cui il token ed il nome
	res.cookie('user', { token: token, name: user.nome});
    res.status(200).json({
		success: true
	});

});

// Route per registrazione
/**
 * @openapi
 * /api/v1/authentication/subscribe:
 *  post:
 *   description: Controlla se l utente esiste e in caso non affermativo lo iscrive
 *   summary: Fa la registazione se l utente non esiste
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
 *    200:
 *     description: Registrazione avvenuta correttamente
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true ed indica che non ci sono stati errori
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

	// Controlla se l'utente è già esistente nel DB
	let userDB = await User.findOne({"email" : req.body.email.toString()}).exec();

	// Se l'utente è stato trovato invia risposta con messaggio d'errore
	if (userDB) {
		res.status(404).json({ success: false, message: 'Utente già esistente' });
		return;
	}

	// Se l'utente non è stato trovato, lo crea
	let user = new User({
		nome: req.body.name,
	    cognome: req.body.surname,
	    dataDiNascita: req.body.birthdate,
		email: req.body.email,
		password: req.body.password,
	    tipoDiUtente: req.body.userType
    });

	// Aggiunge l'utente creato nel DB
	user = await user.save();


	// Creazione token

	var payload = {
		name: user.nome,
		surname: user.cognome,
		birthdate: user.dataDiNascita,
		email: user.email,
		password: user.password,
		userType: user.tipoDiUtente,
		email: user.email,
		id: user.id
	}

	var options = {
		expiresIn: 120 // Scadenza dopo 2 minuti
	}

	var token = jwt.sign(payload, process.env.TOKEN_SECRET, options);


	// Creazione cookie contenente dati dell'utente tra cui il token ed il nome
	res.cookie('user', { token: token, name: user.nome});

    res.status(200).json({
		success: true
	});

});

// Route per controllare se utente è loggato
/**
 * @openapi
 * /api/v1/authentication/checkIfLogged:
 *  get:
 *   description: Controlla se l utente e gia loggato
 *   summary: Fa la registazione se l utente non esiste
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
 *         name:
 *          type: string
 *          description: Contiene il nome dell utente
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
router.get('/checkIfLogged', async (req, res) => {

    // Prende il cookie contenente i dati dell'utente
    var userCookie = req.cookies['user'];

    // Controlla se il cookie è settato
    if(!userCookie) {

        // In caso non sia settato, manda un messaggio di errore
        res.status(404).json({
			success: false,
			message: 'Cookie non trovato'
		});
		return;
	}

	// Prende il token ed il nome dell'utente dal cookie
	var userName = userCookie.name;
	token = userCookie.token;

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
				name: userName,
				message: 'Token valido'
			});
		}
	});
});

// Route per fare il logout dell'utente
/**
 * @openapi
 * /api/v1/authentication/logout:
 *  get:
 *   description: Cancella il cookie dell utente se esiste
 *   summary: Fa il logout dell utente
 *   responses:
 *    200:
 *     description: Restituisce un messaggio che dice che il cookie non e stato trovato o che e stato cancellato correttamente a seconda che lo trovi o meno
 *     content:
 *      application/json:
 *       schema:
 *        properties:
 *         success:
 *          type: boolean
 *          description: Vale true se il cookie e stato cancellato e false se non esisteva
 *         message:
 *          type: string
 *          description: Messaggio che contiene informazioni sull azione fatta
 */
router.get('/logout', async (req, res) => {

    // Prende il cookie contenente i dati dell'utente
    var userCookie = req.cookies['user'];

    // Controlla se il cookie è settato
    if(!userCookie) {

        // In caso non sia settato, manda un messaggio che lo segnala
        res.status(200).json({
			success: false,
			message: 'Cookie non trovato'
		});
		return;
	}

    // Rimuove il cookie
    res.clearCookie('user');

    // Invia messaggio di corretta rimozione del cookie
    res.status(200).json({
        success: true,
        message: 'Cookie rimosso'
    });
});


module.exports = router;
