const request = require('supertest');
const app = require('./../app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const EventSubscription = require('./../models/eventsubscription');
const Event = require('./../models/event');

var payload = {
    name: "Mario",
    surname: "Rossi",
    birthdate: new Date("1990-05-18T00:00:00.000Z"),
    email: "mario.rossi@gmail.com",
    userType: "turista",
    id: "627fdb1d95b0619bf9e97711"
};

var tokenVal = jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: 86400} ); // create a valid token;

var tokenNoV = tokenVal + "helloThere"; // create a valid token;

describe('POST /api/v1/eventSubscription/eventSubcribable', () => {

    beforeAll(() => {
        jest.setTimeout(8000);
        eventSubSpy = jest.spyOn(EventSubscription, 'findOne').mockImplementation((crit) => {
            if(crit["idTurista"] == "627fdb1d95b0619bf9e97711" && crit["idEvento"] == "62838c1f3ba701dd200682e9")
            {
                return {
                  _id: "6296197667e9f7f2f801cab3",
                  idEvento: "62838c1f3ba701dd200682e9",
                  idTurista: "627fdb1d95b0619bf9e97711"
                }
            } else {return {}}
        });

        eventSubSpy = jest.spyOn(Event, 'find').mockImplementation((crit) => {
            if(crit["_id"] == "62838c1f3ba701dd200682e9")
            {
                return {
                    _id: "62838c1f3ba701dd200682e9",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2022-01-18T00:00:00.000+00:00",
                    dataFine: "2022-02-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 994,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            } else {return []}
        });
    });
    afterAll(() => {});

    test('POST /api/v1/eventSubscription/eventSubcribable con token non valido', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenNoV, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(401, {
            success: false,
            message: 'UserNotLogged'
        });
    });

    test('POST /api/v1/eventSubscription/eventSubcribable con token valido ma id evento non esistente', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1f3ba701dd200672e9"}).set('Accept', 'application/json')
        .expect(404, {
            success: false,
            message: "EventNotFound"
        });
    });

    test('POST /api/v1/eventSubscription/eventSubcribable con token valido e utente iscritto', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(200, {
            success: true,
            message: 'UserSubscribed'
        });
    });
});

describe('POST /api/v1/eventSubscription/eventSubcribable', () => {
    // token
    // event
    // 200 UserNotSubscribed
    // 200 UserSubscribed
    // 401 UserNotLogged

    beforeAll(() => {
        jest.setTimeout(8000);
        eventSubSpy = jest.spyOn(EventSubscription, 'findOne').mockImplementation((crit) => {
            if(crit["idTurista"] == "627fdb1d95b0619bf9e97711" && crit["idEvento"] == "62838c1f3ba701dd200682e9")
            {
                return {
                  _id: "6296197667e9f7f2f801cab3",
                  idEvento: "62838c1f3ba701dd200682e9",
                  idTurista: "627fdb1d95b0619bf9e97711"
                }
            } else {return {}}
        });

        eventSubSpy = jest.spyOn(Event, 'find').mockImplementation((crit) => {
            if(crit["_id"] == "62838c1f3ba701dd200682e9")
            {
                return {
                    _id: "62838c1f3ba701dd200682e9",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2022-01-18T00:00:00.000+00:00",
                    dataFine: "2022-02-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 994,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            } else {return []}
        });
    });
    afterAll(() => {});

    test('POST /api/v1/eventSubscription/eventSubcribable con token non valido', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenNoV, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(401, {
            success: false,
            message: 'UserNotLogged'
        });
    });

    test('POST /api/v1/eventSubscription/eventSubcribable con token valido ma id evento non esistente', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1f3ba701dd200672e9"}).set('Accept', 'application/json')
        .expect(404, {
            success: false,
            message: "EventNotFound"
        });
    });

    test('POST /api/v1/eventSubscription/eventSubcribable con token valido e utente iscritto', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(200, {
            success: true,
            message: 'UserSubscribed'
        });
    });
});
