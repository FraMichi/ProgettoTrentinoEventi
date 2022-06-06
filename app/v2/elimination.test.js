const request  = require('supertest');
const app      = require('./../app.js');
const jwt      = require('jsonwebtoken');

describe('DELETE /api/v2/elimination/deleteEvent', () => {

    beforeAll( async () => {
        const Event = require('./../models/event');
        const EventSubscription = require('./../models/eventsubscription');
        const EventReview = require('./../models/eventreview');

        newEventFindOneSpy = jest.spyOn(Event, 'findOne').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return {
                    _id: "627fdb1d95b0619bf9e97711",
                    descrizione: "Evento",
            		dataInizio: "2022-05-18T00:00:00Z",
            		dataFine: "2023-05-18T00:00:00Z",
            		indirizzo: "Via prova",
            		citta: "Trento",
            		postiDisponibili: 138,
            		postiTotali: 140,
            		idCategoria: "627fdb1d95b0619bf9e97722",
            		idGestore: "62829e5e6c2ce7457eda4f12"
                };
            }
            return undefined;
        });

        newEventDeleteOneSpy = jest.spyOn(Event, 'deleteOne').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return {
                    _id: "627fdb1d95b0619bf9e97711",
                    descrizione: "Evento",
            		dataInizio: "2022-05-18T00:00:00Z",
            		dataFine: "2023-05-18T00:00:00Z",
            		indirizzo: "Via prova",
            		citta: "Trento",
            		postiDisponibili: 138,
            		postiTotali: 140,
            		idCategoria: "627fdb1d95b0619bf9e97722",
            		idGestore: "62829e5e6c2ce7457eda4f12"
                };
            }
            return undefined;
        });

        newEventSubDeleteManySpy = jest.spyOn(EventSubscription, 'deleteMany').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return [{
                    idEvento: "627fdb1d95b0619bf9e97711",
                    idTurista: "627fdb1d95b0619bf9e93333"
                },
                {
                    idEvento: "627fdb1d95b0619bf9e97711",
                    idTurista: "627fdb1d95b0619bf9e94444"
                }];
            }
            return undefined;
        });

        newEventReviewDeleteManySpy = jest.spyOn(EventReview, 'deleteMany').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return [{
                    recensione: "recensione1",
                    risposta: "risposta1",
                    idEvento: "627fdb1d95b0619bf9e97711",
                    idUtente: "627fdb1d95b0619bf9e93333",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                },
                {
                    recensione: "recensione2",
                    risposta: "risposta2",
                    idEvento: "627fdb1d95b0619bf9e97711",
                    idUtente: "627fdb1d95b0619bf9e94444",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                }];
            }
            return undefined;
        });
    });

    afterAll( () => {
        newEventFindOneSpy.mockRestore();
        newEventDeleteOneSpy.mockRestore();
        newEventSubDeleteManySpy.mockRestore();
        newEventReviewDeleteManySpy.mockRestore();
    });

    var payload = {
		name: "Alessandro",
		surname: "Rossi",
		birthdate: "1964-02-20T00:00:00Z",
		email: "alessandro.rossi@gmail.com",
		userType: "gestore",
        id: "62829e5e6c2ce7457eda4f12"
  	}

    var payloadNO = {
        name: "Mario",
        surname: "Rossi",
        birthdate: "1990-05-18T00:00:00Z",
        email: "mario.rossi@gmail.com",
        userType: "turista",
        id: "627fdb1d95b0619bf9e97711"
  	}

    var expire = 1800;

    var token = jwt.sign(
        payload,
        process.env.TOKEN_SECRET,
        {expiresIn: expire}
    );

    // token Not Owner, è il token di un utente non proprietario dell'evento
    var tokenNO = jwt.sign(
        payloadNO,
        process.env.TOKEN_SECRET,
        {expiresIn: expire}
    );

    test('DELETE /api/v2/elimination/deleteEvent con token non valido', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteEvent')
            .set('Accept', 'application/json')
            .send({ token: token + "123", eventId: '627fdb1d95b0619bf9e97711' })
            .expect(401, { success: false, message: 'Token non valido' });
    });

    test('DELETE /api/v2/elimination/deleteEvent con formato id evento non corretto', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteEvent')
            .set('Accept', 'application/json')
            .send({ token: token, eventId: '123456789' })
            .expect(400, { success: false, message: "MongoDBFormatException" });
    });

    test('DELETE /api/v2/elimination/deleteEvent con evento non esistente', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteEvent')
            .set('Accept', 'application/json')
            .send({ token: token, eventId: '62723ab1d95b083bf9e97711' })
            .expect(404, { success: false, message: 'Evento non trovato' });
    });

    test('DELETE /api/v2/elimination/deleteEvent con utente non proprietario', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteEvent')
            .set('Accept', 'application/json')
            .send({ token: tokenNO, eventId: '627fdb1d95b0619bf9e97711' })
            .expect(403, { success: false, message: "Non sei il proprietario dell'evento" });
    });

    test('DELETE /api/v2/elimination/deleteEvent correttamente', () => {
            return request(app)
            .delete('/api/v2/elimination/deleteEvent')
            .set('Accept', 'application/json')
            .send({ token: token, eventId: '627fdb1d95b0619bf9e97711' })
            .expect(200, { success: true, message: 'Evento eliminato!' });
    });

});

describe('DELETE /api/v2/elimination/deleteHousing', () => {

    beforeAll( async () => {
        const Housing = require('./../models/housing');
        const HousingSubscription = require('./../models/housingsubscription');
        const HousingReview = require('./../models/housingreview');

        newHousingFindOneSpy = jest.spyOn(Housing, 'findOne').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return {
                    _id: "627fdb1d95b0619bf9e97711",
                    titolo: "Alloggio",
            		dataInizio: "2022-05-18T00:00:00Z",
            		dataFine: "2023-05-18T00:00:00Z",
            		indirizzo: "Via prova",
            		citta: "Trento",
            		idGestore: "62829e5e6c2ce7457eda4f12"
                };
            }
            return undefined;
        });

        newHousingDeleteOneSpy = jest.spyOn(Housing, 'deleteOne').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return {
                    _id: "627fdb1d95b0619bf9e97711",
                    titolo: "Alloggio",
            		dataInizio: "2022-05-18T00:00:00Z",
            		dataFine: "2023-05-18T00:00:00Z",
            		indirizzo: "Via prova",
            		citta: "Trento",
            		idGestore: "62829e5e6c2ce7457eda4f12"
                };
            }
            return undefined;
        });

        newHousingSubDeleteManySpy = jest.spyOn(HousingSubscription, 'deleteMany').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return [{
                    idAlloggio: "627fdb1d95b0619bf9e97711",
                    idTurista: "627fdb1d95b0619bf9e94444",
                	dataInizio: "2022-05-24T00:00:00Z",
                	dataFine: "2022-06-12T00:00:00Z"
                },
                {
                    idAlloggio: "627fdb1d95b0619bf9e97711",
                    idTurista: "627fdb1d95b0619bf9e93333",
                    dataInizio: "2022-07-22T00:00:00Z",
                	dataFine: "2022-09-13T00:00:00Z"
                }];
            }
            return undefined;
        });

        newHousingReviewDeleteManySpy = jest.spyOn(HousingReview, 'deleteMany').mockImplementation((criterias) => {
            if(criterias['_id'] == "627fdb1d95b0619bf9e97711") {
                return [{
                    recensione: "recensione1",
                    risposta: "risposta1",
                    idAlloggio: "627fdb1d95b0619bf9e97711",
                    idUtente: "627fdb1d95b0619bf9e93333",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                },
                {
                    recensione: "recensione2",
                    risposta: "risposta2",
                    idAlloggio: "627fdb1d95b0619bf9e97711",
                    idUtente: "627fdb1d95b0619bf9e94444",
                    idGestore: "62829e5e6c2ce7457eda4f12"
                }];
            }
            return undefined;
        });
    });

    afterAll( () => {
        newHousingFindOneSpy.mockRestore();
        newHousingDeleteOneSpy.mockRestore();
        newHousingSubDeleteManySpy.mockRestore();
        newHousingReviewDeleteManySpy.mockRestore();
    });

    var payload = {
		name: "Alessandro",
		surname: "Rossi",
		birthdate: "1964-02-20T00:00:00Z",
		email: "alessandro.rossi@gmail.com",
		userType: "gestore",
        id: "62829e5e6c2ce7457eda4f12"
  	}

    var payloadNO = {
        name: "Mario",
        surname: "Rossi",
        birthdate: "1990-05-18T00:00:00Z",
        email: "mario.rossi@gmail.com",
        userType: "turista",
        id: "627fdb1d95b0619bf9e97711"
  	}

    var expire = 1800;

    var token = jwt.sign(
        payload,
        process.env.TOKEN_SECRET,
        {expiresIn: expire}
    );

    // token Not Owner, è il token di un utente non proprietario dell'evento
    var tokenNO = jwt.sign(
        payloadNO,
        process.env.TOKEN_SECRET,
        {expiresIn: expire}
    );

    test('DELETE /api/v2/elimination/deleteHousing con token non valido', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteHousing')
            .set('Accept', 'application/json')
            .send({ token: token + "123", housingId: '627fdb1d95b0619bf9e97711' })
            .expect(401, { success: false, message: 'Token non valido' });
    });

    test('DELETE /api/v2/elimination/deleteHousing con formato id alloggio non corretto', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteHousing')
            .set('Accept', 'application/json')
            .send({ token: token, housingId: '123456789' })
            .expect(400, { success: false, message: "MongoDBFormatException" });
    });

    test('DELETE /api/v2/elimination/deleteHousing con alloggio non esistente', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteHousing')
            .set('Accept', 'application/json')
            .send({ token: token, housingId: '62723ab1d95b083bf9e977aa' })
            .expect(404, { success: false, message: 'Alloggio non trovato' });
    });

    test('DELETE /api/v2/elimination/deleteHousing con utente non proprietario', () => {
        return request(app)
            .delete('/api/v2/elimination/deleteHousing')
            .set('Accept', 'application/json')
            .send({ token: tokenNO, housingId: '627fdb1d95b0619bf9e97711' })
            .expect(403, { success: false, message: "Non sei il proprietario dell'alloggio" });
    });

    test('DELETE /api/v2/elimination/deleteHousing correttamente', () => {
            return request(app)
            .delete('/api/v2/elimination/deleteHousing')
            .set('Accept', 'application/json')
            .send({ token: token, housingId: '627fdb1d95b0619bf9e97711' })
            .expect(200, { success: true, message: 'Alloggio eliminato!' });
    });

});
