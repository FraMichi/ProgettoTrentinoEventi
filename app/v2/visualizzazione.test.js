const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./../app');
const mongoose = require('mongoose');
const EventSubscription = require('./../models/eventsubscription');
const Event = require('./../models/event');

// Crea token di utente iscritto ad eventi
var payloadSome = {
    _id: '62897b4e22fb362b808d3910',
    nome: 'Alice',
    cognome: 'Debbia',
    dataDiNascita: '1998-03-24T00:00:00.000+00:00',
    email: 'alice.debbia@gmail.com',
    password: '12345',
    tipoDiUtente: 'gestore'
}
var tokenSome = jwt.sign(
    payloadSome,
    process.env.TOKEN_SECRET,
    {expiresIn: 1800}
);

// Crea token di utente non iscritto ad eventi
var payloadNone = {
    _id: '627fdb1d95b0619bf9e97711',
    nome: 'Mario',
    cognome: 'Rossi',
    dataDiNascita: '1998-03-24T00:00:00.000+00:00',
    email: 'mario.rossi@gmail.com',
    password: '123',
    tipoDiUtente: 'turista'
}
var tokenNone = jwt.sign(
    payloadNone,
    process.env.TOKEN_SECRET,
    {expiresIn: 1800}
);

var eventList = [
    {idEvento: "62897c3d3d0c2508a888588f"},
    {idEvento: "628e98cddc2d52eeb88a824a"}
]

describe('POST /api/v2/visualizzazione/eventListSubscribed', () => {

    beforeAll( async () => {
        jest.setTimeout(8000);

        //Crea mock-function per find in EventSubscription
        eventsFind = jest.spyOn(EventSubscription, 'find').mockImplementation((crit) => {
            if (crit["idTurista"] == "62897b4e22fb362b808d3910") {
                return [
                    {
                        _id: "628e63b2e16b6a43056febf8",
                        idEvento: "62897c3d3d0c2508a888588f",
                        idTurista: "62897b4e22fb362b808d3910"
                    },
                    {
                        _id: "6290a6f26a47491eec9fcb85",
                        idEvento: "628e98cddc2d52eeb88a824a",
                        idTurista: "62897b4e22fb362b808d3910"
                    }
                ]
            } else if (crit["idTurista"] == "627fdb1d95b0619bf9e97711") {
                return []
            }
        });

        //Crea mock-function per finOne in category
        eventItemFind = jest.spyOn(Event, 'findOne').mockImplementation((crit) => {
            if (crit["_id"] == "628e98cddc2d52eeb88a824a") {
                return {
                    _id: "628e98cddc2d52eeb88a824a",
                    titolo: "Vinokilo",
                    descrizione: "Vendita di vestiti vintage al kilo",
                    dataInizio: '2022-05-06T00:00:00.000+00:00',
                    dataFine: '2022-05-08T00:00:00.000+00:00',
                    indirizzo: "Viale Italia 5",
                    citta: "Rovereto",
                    postiDisponibili: '198',
                    postiTotali: '200',
                    idCategoria: "627fd7dc95b0619bf9e9770e",
                    idGestore: "62897b4e22fb362b808d3910"
                };
            } else if (crit["_id"] == "62897c3d3d0c2508a888588f") {
                return {
                    _id: "62897c3d3d0c2508a888588f",
                    titolo: "Partita di pallavolo",
                    descrizione: "Coppa Italia di pallavolo femminile",
                    dataInizio: '2022-05-29T00:00:00.000+00:00',
                    dataFine: '2022-05-29T00:00:00.000+00:00',
                    indirizzo: "Viale Italia, 5",
                    citta: "Rovereto",
                    postiDisponibili: '1994',
                    postiTotali: '2000',
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62897b4e22fb362b808d3910"
                };
            } else {return null}
        });

    });

    afterAll(() => {
    eventsFind.mockRestore();
    eventItemFind.mockRestore();
});

    test('POST /api/v2/visualizzazione/eventListSubscribed con token assente o invalido', () => {
        return request(app)
            .post('/api/v2/visualizzazione/eventListSubscribed')
            .expect(401, {success: false, message: 'Utente non loggato'});
      });

    test('POST /api/v2/visualizzazione/eventListSubscribed con nessuna iscrizione ad eventi', () => {
      return request(app)
        .post('/api/v2/visualizzazione/eventListSubscribed')
        .set('Accept', 'application/json')
        .send({token: tokenNone})
        .expect(200, {success: false, message: 'Non sei iscritto/a a nessun evento'});
    });

    test('POST /api/v2/visualizzazione/eventListSubscribed con iscrizioni ad eventi', () => {
      return request(app)
        .post('/api/v2/visualizzazione/eventListSubscribed')
        .set('Accept', 'application/json')
        // .set('loggedUser', payloadSome)
        .send({ token: tokenSome})
        .expect(200, eventList);
    });
});
