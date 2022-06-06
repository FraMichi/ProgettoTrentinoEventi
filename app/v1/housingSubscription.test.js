const request = require('supertest');
const app = require('./../app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const HousingSubscription = require('./../models/housingsubscription');
const Housing = require('./../models/housing');

var payload = {
    name: "Mario",
    surname: "Rossi",
    birthdate: new Date("1990-05-18T00:00:00.000Z"),
    email: "mario.rossi@gmail.com",
    userType: "turista",
    id: "627fdb1d95b0619bf9e97711"
};

var tokenVal = jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: 86400} ); // create a valid token;

var tokenNoV = tokenVal + "helloThere"; // token non valido;

describe('POST /api/v1/housingSubscription/getHousingSlots', () => {
    beforeAll(() => {
        jest.setTimeout(8000);

        housingFind = jest.spyOn(Housing, 'find').mockImplementation((crit) => {
            if(crit["_id"] == "627fdec095b0619bf9e97717")
            {
                return  [
                            {
                            titolo: 'Appartamento Trento Centro Storico',
                            descrizione: 'Appartamento a Trento in zona Centro Storico',
                            dataInizio: new Date("2022-05-18T00:00:00.000Z"),
                            dataFine: new Date("2022-08-02T00:00:00.000Z"),
                            indirizzo: 'Via Roma n.12, Trento, TN, Italia',
                            citta: 'Trento',
                            idGestore: '627fdb2b95b0619bf9e97712'
                            }
                        ]
            } else {return []}
        });
        housingSubFind = jest.spyOn(HousingSubscription, 'find').mockImplementation((crit) => {
            if(crit["idAlloggio"] == "627fdec095b0619bf9e97717")
            {
                return  [
                            {
                                idAlloggio: '627fdec095b0619bf9e97717',
                                idTurista: '62820677b7b4b123550367b8',
                                dataInizio: new Date("2022-07-11T00:00:00.000Z"),
                                dataFine: new Date("2022-07-17T00:00:00.000Z")
                            },
                            {
                                idAlloggio: '627fdec095b0619bf9e97717',
                                idTurista: '62820677b7b4b123550367b8',
                                dataInizio: new Date("2022-06-20T00:00:00.000Z"),
                                dataFine: new Date("2022-07-10T00:00:00.000Z")
                            }
                        ]
            } else {return []}
        });
    });

    afterAll(() => {
        housingFind.mockRestore();
        housingSubFind.mockRestore();
    });

    /*
        UTENTE NON LOGGATO
    */
    // id non conforme
    test('POST /api/v1/housingSubscription/getHousingSlots con id non conforme', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenNoV, id:"62838c1f3sdfsdfsdgsdgsdba701dd200682e9"}).set('Accept', 'application/json')
        .expect(400, {
            success: false,
            message: "MongoDBFormatException"
        });
    });

    // id non presente
    test('POST /api/v1/housingSubscription/getHousingSlots con id alloggio assente', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenNoV}).set('Accept', 'application/json')
        .expect(400, {success: false, message:'MissingHousing' });
    });

    // alloggio non esistente
    test('POST /api/v1/housingSubscription/getHousingSlots con alloggio non esistente', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenNoV, id:"627fdec095b0619bf9e00000"}).set('Accept', 'application/json')
        .expect(404, {
            success: false,
            message: "HousingNotFound"
        });
    });

    // alloggio esistente
    test('POST /api/v1/housingSubscription/getHousingSlots con alloggio esistente', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenNoV, id:"627fdec095b0619bf9e97717"}).set('Accept', 'application/json')
        .expect(200, [
        {
          init: "2022-05-18T00:00:00.000Z",
          finl: "2022-06-20T00:00:00.000Z",
          free: true,
          ofUser: false

        },
        {
          init: "2022-06-20T00:00:00.000Z",
          finl: "2022-07-10T00:00:00.000Z",
          free: false,
          ofUser: false
        },
        {
          init: "2022-07-10T00:00:00.000Z",
          finl: "2022-07-11T00:00:00.000Z",
          free: true,
          ofUser: false
        },
        {
          init: "2022-07-11T00:00:00.000Z",
          finl: "2022-07-17T00:00:00.000Z",
          free: false,
          ofUser: false
        },
        {
          init: "2022-07-17T00:00:00.000Z",
          finl: "2022-08-02T00:00:00.000Z",
          free: true,
          ofUser: false
        }
      ]);
    });

    /*
        UTENTE LOGGATO
    */
    // id non conforme
    test('POST /api/v1/housingSubscription/getHousingSlots con id non conforme', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenVal, id:"62838c1f3sdfsdfsdgsdgsdba701dd200682e9"}).set('Accept', 'application/json')
        .expect(400, {
            success: false,
            message: "MongoDBFormatException"
        });
    });

    // alloggio non esistente
    test('POST /api/v1/housingSubscription/getHousingSlots con alloggio non esistente', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenVal, id:"627fdec095b0619bf9e00000"}).set('Accept', 'application/json')
        .expect(404, {
            success: false,
            message: "HousingNotFound"
        });
    });

    // alloggio non esistentenp
    test('POST /api/v1/housingSubscription/getHousingSlots', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenVal, id:"627fdec095b0619bf9e97717"}).set('Accept', 'application/json')
        .expect(200, [
        {
          init: "2022-05-18T00:00:00.000Z",
          finl: "2022-06-20T00:00:00.000Z",
          free: true,
          ofUser: false

        },
        {
          init: "2022-06-20T00:00:00.000Z",
          finl: "2022-07-10T00:00:00.000Z",
          free: false,
          ofUser: false
        },
        {
          init: "2022-07-10T00:00:00.000Z",
          finl: "2022-07-11T00:00:00.000Z",
          free: true,
          ofUser: false
        },
        {
          init: "2022-07-11T00:00:00.000Z",
          finl: "2022-07-17T00:00:00.000Z",
          free: false,
          ofUser: false
        },
        {
          init: "2022-07-17T00:00:00.000Z",
          finl: "2022-08-02T00:00:00.000Z",
          free: true,
          ofUser: false
        }
      ]);
    });
});

describe('POST /api/v1/housingSubscription/subscribeHousing', () => {
    beforeAll(() => {
        jest.setTimeout(8000);

        housingFind = jest.spyOn(Housing, 'findOne').mockImplementation((crit) => {
            if(crit["_id"] == "627fdec095b0619bf9e97717")
            {
                return  {
                            titolo: 'Appartamento Trento Centro Storico',
                            descrizione: 'Appartamento a Trento in zona Centro Storico',
                            dataInizio: new Date("2022-05-18T00:00:00.000Z"),
                            dataFine: new Date("2022-08-02T00:00:00.000Z"),
                            indirizzo: 'Via Roma n.12, Trento, TN, Italia',
                            citta: 'Trento',
                            idGestore: '627fdb2b95b0619bf9e97712'
                        }

            } else {return []}
        });
        housingSubFind = jest.spyOn(HousingSubscription, 'find').mockImplementation((crit) => {
            if(crit["idAlloggio"] == "627fdec095b0619bf9e97717")
            {
                return  [
                            {
                                idAlloggio: '627fdec095b0619bf9e97717',
                                idTurista: '62820677b7b4b123550367b8',
                                dataInizio: new Date("2022-07-11T00:00:00.000Z"),
                                dataFine: new Date("2022-07-17T00:00:00.000Z")
                            },
                            {
                                idAlloggio: '627fdec095b0619bf9e97717',
                                idTurista: '62820677b7b4b123550367b8',
                                dataInizio: new Date("2022-06-20T00:00:00.000Z"),
                                dataFine: new Date("2022-07-10T00:00:00.000Z")
                            }
                        ]
            } else {return []}
        });
        housingSubCreationSpy = jest.spyOn(HousingSubscription, 'create').mockImplementation((crit) => {
            return {}
        });
    });

    afterAll(() => {
        housingFind.mockRestore();
        housingSubFind.mockRestore();
        housingSubCreationSpy.mockRestore();
    });

    // ordine data inizio/finale scorretto
    test('POST /api/v1/housingSubscription/subscribeHousing con ordine data inizio/finale scorretto', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenNoV,
            housingId:"62838c2e9",
            initDate: "2022-07-20T00:00:00.000Z",
            finlDate: "2022-06-17T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(200, {
            success: false,
            message: "BadDateOrder"
        });
    });

    // id non conforme
    test('POST /api/v1/housingSubscription/subscribeHousing con id non conforme', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenNoV,
            housingId:"62838c2e9",
            initDate: "2022-06-20T00:00:00.000Z",
            finlDate: "2022-07-17T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(400, {
            success: false,
            message: "MongoDBFormatException"
        });
    });

    // id assente
    test('POST /api/v1/housingSubscription/subscribeHousing con id assente', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenNoV,
            initDate: "2022-06-20T00:00:00.000Z",
            finlDate: "2022-07-17T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(400, {success: false, message:"MissingParameters"});
    });

    // date assenti
    test('POST /api/v1/housingSubscription/subscribeHousing con id assente', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenNoV,
            housingId:"627fdec095b0619bf9e97717"
        }).set('Accept', 'application/json')
        .expect(400, {success: false, message:"MissingParameters"});
    });

    // token non valido
    test('POST /api/v1/housingSubscription/subscribeHousing con token non valido', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenNoV,
            housingId:"627fdec095b0619bf9e97717",
            initDate: "2022-06-20T00:00:00.000Z",
            finlDate: "2022-07-17T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(401, {
            success: false,
            message: "TokenNotValid"
        });
    });

    // housing non esistente
    test('POST /api/v1/housingSubscription/subscribeHousing con alloggio non esistente', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenVal,
            housingId:"627fdb2b95b0619bf9e00000",
            initDate: "2022-06-20T00:00:00.000Z",
            finlDate: "2022-07-17T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(404, {
            success: false,
            message: "HousingNotFound"
        });
    });

    // initDate non coerente
    test('POST /api/v1/housingSubscription/subscribeHousing con data iniziale non coerente con alloggio specifico', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenVal,
            housingId:"627fdec095b0619bf9e97717",
            initDate: "2022-05-17T00:00:00.000Z",
            finlDate: "2022-08-02T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(200, {
            success: false,
            message: "BadDateOffset"
        });
    });

    // finlDate non coerente
    test('POST /api/v1/housingSubscription/subscribeHousing con data finale non coerente con alloggio specifico', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenVal,
            housingId:"627fdec095b0619bf9e97717",
            initDate: "2022-05-18T00:00:00.000Z",
            finlDate: "2022-08-03T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(200, {
            success: false,
            message: "BadDateOffset"
        });
    });

    // sovrapposizione data iniziale slot prenotato
    test('POST /api/v1/housingSubscription/subscribeHousing con sovrapposizione della data iniziale con slot antecedente', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenVal,
            housingId:"627fdec095b0619bf9e97717",
            initDate: "2022-07-16T00:00:00.000Z",
            finlDate: "2022-07-19T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(200, {
            success: false,
            message: "DateSlotOverlap"
        });
    });

    // sovrapposizione data finale slot prenotato
    test('POST /api/v1/housingSubscription/subscribeHousing con sovrapposizione della data finale con slot successivo', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenVal,
            housingId:"627fdec095b0619bf9e97717",
            initDate: "2022-07-10T00:00:00.000Z",
            finlDate: "2022-07-12T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(200, {
            success: false,
            message: "DateSlotOverlap"
        });
    });

    // creazione prenotazione
    test('POST /api/v1/housingSubscription/subscribeHousing con creazione corretta della prenotazione', () => {
        return request(app).post('/api/v1/housingSubscription/subscribeHousing')
        .send({
            token: tokenVal,
            housingId:"627fdec095b0619bf9e97717",
            initDate: "2022-07-10T00:00:00.000Z",
            finlDate: "2022-07-11T00:00:00.000Z"
        }).set('Accept', 'application/json')
        .expect(201, {
            success: true,
            message: "UserSubscribed"
        });
    });
});
