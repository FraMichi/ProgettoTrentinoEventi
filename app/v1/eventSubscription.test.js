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
        eventFindOne = jest.spyOn(EventSubscription, 'findOne').mockImplementation((crit) => {
            if(crit["idTurista"] == "627fdb1d95b0619bf9e97711" && crit["idEvento"] == "62838c1f3ba701dd200682e9")
            {
                return {
                  _id: "6296197667e9f7f2f801cab3",
                  idEvento: "62838c1f3ba701dd200682e9",
                  idTurista: "627fdb1d95b0619bf9e97711"
                }
            } else {return undefined}
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
            } else if (crit["_id"] == "62838c1f3ba701dd200682e8")
            {
                return {
                    _id: "62838c1f3ba701dd200682e8",
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
    afterAll(() => {
        eventFindOne.mockRestore();
        eventSubSpy.mockRestore();
    });

    // token non valido
    test('POST /api/v1/eventSubscription/eventSubcribable con token non valido', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenNoV, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(401, {
            success: false,
            message: 'UserNotLogged'
        });
    });

    // token ok, id evento non conforme
    test('POST /api/v1/eventSubscription/eventSubcribable con id evento non conforme allo standard MongoDB', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1fljfnsdlkfòksamlsd3ba701dd200672e9"}).set('Accept', 'application/json')
        .expect(400, {success: false, message: "MongoDBFormatException"});
    });

    // token ok, id evento non esistente
    test('POST /api/v1/eventSubscription/eventSubcribable con id evento non esistente', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1f3ba701dd200672e9"}).set('Accept', 'application/json')
        .expect(404, {success: false, message: "EventNotFound"});
    });

    // token ok, utente iscritto
    test('POST /api/v1/eventSubscription/eventSubcribable con utente iscritto', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(200, {success: true, message: 'UserSubscribed'});
    });

    // token ok, utente non iscritto
    test('POST /api/v1/eventSubscription/eventSubcribable con utente non iscritto', () => {
        return request(app).post('/api/v1/eventSubscription/eventSubcribable')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e8"}).set('Accept', 'application/json')
        .expect(200, {success: true, message: 'UserNotSubscribed'});
    });
});


describe('POST /api/v1/eventSubscription/createSubscription', () => {
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
            } else {return undefined}
        });
        eventSpy = jest.spyOn(Event, 'find').mockImplementation((crit) => {
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
            } else if (crit["_id"] == "62838c1f3ba701dd200682e8")
            {
                return {
                    _id: "62838c1f3ba701dd200682e8",
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
            } else if (crit["_id"] == "62838c1f3ba701dd200682e0")
            {
                return {
                    _id: "62838c1f3ba701dd200682e0",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2022-01-18T00:00:00.000+00:00",
                    dataFine: "2022-02-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 0,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            }  else if (crit["_id"] == "62838c1f3ba701dd200682e2") {     // evento vecchio
                return {
                    _id: "62838c1f3ba701dd200682e0",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2000-11-18T00:00:00.000+00:00",
                    dataFine: "2000-12-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 0,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            } else {return []}
        });
        eventOneSpy = jest.spyOn(Event, 'findOne').mockImplementation((crit) => {
            if(crit["_id"] == "62838c1f3ba701dd200682e9") {     // si iscritto
                return {
                    _id: "62838c1f3ba701dd200682e9",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2022-11-18T00:00:00.000+00:00",
                    dataFine: "2022-12-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 994,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            } else if (crit["_id"] == "62838c1f3ba701dd200682e8") {     // no iscritto
                return {
                    _id: "62838c1f3ba701dd200682e8",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2022-11-18T00:00:00.000+00:00",
                    dataFine: "2022-12-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 994,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            } else if (crit["_id"] == "62838c1f3ba701dd200682e0") {     // no posti
                return {
                    _id: "62838c1f3ba701dd200682e0",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2022-11-18T00:00:00.000+00:00",
                    dataFine: "2022-12-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 0,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            } else if (crit["_id"] == "62838c1f3ba701dd200682e2") {     // evento vecchio
                return {
                    _id: "62838c1f3ba701dd200682e0",
                    titolo: "Mostra studenti",
                    descrizione: "Mostra fotografica di un fotografo tedesco",
                    dataInizio: "2000-11-18T00:00:00.000+00:00",
                    dataFine: "2000-12-02T00:00:00.000+00:00",
                    indirizzo: "Via Roma n.16, Trento, TN, Italia",
                    citta: "Strigno",
                    postiDisponibili: 0,
                    postiTotali: 1000,
                    idCategoria: "627fd7ef95b0619bf9e9770f",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                };
            } else {return []}
        });
        eventSubCreationSpy = jest.spyOn(EventSubscription, 'create').mockImplementation((crit) => {
            return(crit);
        });
        eventUpdateSpy = jest.spyOn(Event, 'findOneAndUpdate').mockImplementation((crit) => {
            return {crit}
        });
    });

    afterAll(() => {
        eventSubSpy.mockRestore();
        eventSpy.mockRestore();
        eventOneSpy.mockRestore();
        eventSubCreationSpy.mockRestore();
        eventUpdateSpy.mockRestore();
    });

    // token non valido
    test('POST /api/v1/eventSubscription/createSubscription con token non valido', () => {
        return request(app).post('/api/v1/eventSubscription/createSubscription')
        .send({token: tokenNoV, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(401, {
            success: false,
            message: 'UserNotLogged'
        });
    });

    // token ok, id evento non conforme
    test('POST /api/v1/eventSubscription/createSubscription con id evento non conforme', () => {
        return request(app).post('/api/v1/eventSubscription/createSubscription')
        .send({token: tokenVal, event:"62838c1fljfnsdlkfòksamlsd3ba701dd200672e9"}).set('Accept', 'application/json')
        .expect(400, {success: false, message: "MongoDBFormatException"});
    });

    // token ok, id evento non esistente
    test('POST /api/v1/eventSubscription/createSubscription con id evento non esistente', () => {
        return request(app).post('/api/v1/eventSubscription/createSubscription')
        .send({token: tokenVal, event:"62838c1f3ba701dd200672e9"}).set('Accept', 'application/json')
        .expect(404, {
            success: false,
            message: "EventNotFound"
        });
    });

    // token ok, utente già iscritto a evento
    test('POST /api/v1/eventSubscription/createSubscription iscrizione ad evento già iscritto', () => {
        return request(app).post('/api/v1/eventSubscription/createSubscription')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
        .expect(200, {
            success: true,
            message: 'UserAlreadySubscribed'
        });
    });

    // token ok, evento senza posti
    test('POST /api/v1/eventSubscription/createSubscription iscrizione ad evento senza posti disponibili', () => {
        return request(app).post('/api/v1/eventSubscription/createSubscription')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e0"}).set('Accept', 'application/json')
        .expect(200, {
            success: false,
            message: 'NoFreeSeats'
        });
    });

    // evento già finito
    test('POST /api/v1/eventSubscription/createSubscription iscrizione ad evento finito', () => {
        return request(app).post('/api/v1/eventSubscription/createSubscription')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e2"}).set('Accept', 'application/json')
        .expect(200, {
            success: false,
            message: 'TimeExceeded'
        });
    });

    // token ok, utente non iscritto a evento
    test('POST /api/v1/eventSubscription/createSubscription nuova iscrizione effettuata con successo', () => {
        return request(app).post('/api/v1/eventSubscription/createSubscription')
        .send({token: tokenVal, event:"62838c1f3ba701dd200682e8"}).set('Accept', 'application/json')
        .expect(201, {
            success: true,
            message: 'UserSubscribed'
        });
    });
});
