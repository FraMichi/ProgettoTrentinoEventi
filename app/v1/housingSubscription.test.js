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

    beforeAll(() =>
    {
        jest.setTimeout(8000);

        var housingFind = jest.spyOn(Housing, 'find').mockImplementation((crit) => {
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

        var housingSubFind = jest.spyOn(HousingSubscription, 'find').mockImplementation((crit) => {
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

    afterAll(() => {});

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

    // alloggio non esistente
    test('POST /api/v1/housingSubscription/getHousingSlots con alloggio non esistente', () => {
        return request(app).post('/api/v1/housingSubscription/getHousingSlots')
        .send({token: tokenNoV, id:"627fdec095b0619bf9e00000"}).set('Accept', 'application/json')
        .expect(404, {
            success: false,
            message: "HousingNotFound"
        });
    });

    // alloggio non esistentenp
    test('POST /api/v1/housingSubscription/getHousingSlots', () => {
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
