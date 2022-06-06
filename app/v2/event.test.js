const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('./../app');
const mongoose = require('mongoose');
const Category = require('./../models/category');
const User = require('./../models/user');
const Event = require('./../models/event');

var payload = {
    _id: '62897b4e22fb362b808d3910',
    nome: 'Alice',
    cognome: 'Debbia',
    dataDiNascita: '1998-03-24T00:00:00.000+00:00',
    email: 'alice.debbia@gmail.com',
    password: '12345',
    tipoDiUtente: 'gestore'
}

// Crea un token valido
var token = jwt.sign(
    payload,
    process.env.TOKEN_SECRET,
    {expiresIn: 1800}
);

describe('POST /api/v2/event/create', () => {

    beforeAll( async () => {
        jest.setTimeout(8000);

        //Crea mock-function per findOne in category
        categoryFind = jest.spyOn(Category, 'findOne').mockImplementation((crit) => {
            if(crit["_id"] == "627fd7ef95b0619bf9e1110f") {
                return false;
            } else if (crit["_id"] == "627fd7ef95b0619bf9e9770f") {
                return {
                    _id: "627fd7ef95b0619bf9e9770f",
                    tipoCategoria: "evento sportivo"
                };
            }
        });

        //Crea mock-function per finOne in category
        userFind = jest.spyOn(User, 'findOne').mockImplementation((crit) => {
            if(crit["_id"] == "627fdb1d95b0619bf9e97711") {
                return {
                    _id: "627fdb1d95b0619bf9e97711",
                    nome: "Mario",
                    cognome: "Rossi",
                    dataDiNascita: "1990-05-18T00:00:00.000+00:00",
                    email: "mario.rossi@gmail.com",
                    password: "123",
                    tipoDiUtente: "turista"
                };
            } else if (crit["_id"] == "62897b4e22fb362b808d3910") {
                return {
                    _id: "62897b4e22fb362b808d3910",
                    nome: "Alice",
                    cognome: "Debbia",
                    dataDiNascita: "1998-03-24T00:00:00.000+00:00",
                    email: "alice.debbia@gmail.com",
                    password: "12345",
                    tipoDiUtente: "gestore"
                };
            } else {return undefined}
        });

        eventoCreaSpy = jest.spyOn(Event, 'create').mockImplementation((crit) => {
            return {}
        });

    });

    afterAll(() => {});

    test('POST /api/v2/event/create con token assente o invalido', () => {
        return request(app)
            .post('/api/v2/event/create')
            .expect(401, {success: false, message: 'Utente non loggato'});
      });

    test('POST /api/v2/event/create con nessun campo specificato', () => {
      return request(app)
        .post('/api/v2/event/create')
        .set('Accept', 'application/json')
        .send({token: token})
        .expect(400, {success: false, message: 'Inserire tutti i campi'});
    });

    test('POST /api/v2/event/create con qualche campo non specificato', () => {
      return request(app)
        .post('/api/v2/event/create')
        .set('Accept', 'application/json')
        .send({
            token: token,
            name: 'EventoTest',
            city: 'Trento',
            total: '120'
        })
        .expect(400, {success: false, message: 'Inserire tutti i campi'});
    });

    test('POST /api/v2/event/create con date nel formato sbagliato', () => {
      return request(app)
        .post('/api/v2/event/create')
        .set('Accept', 'application/json')
        .send({
            token: token,
            name: 'Casa Test',
            description: 'Descrizione del Test',
            dstart: '2022-02-3',
            dend: '24/05/2022',
            address: 'via Test 42',
            city: 'Trento',
            total: '120',
            idCategoria: '627fd7ef95b0619bf9e9770f',
            userId: '62897b4e22fb362b808d3910'
        })
        .expect(400, {success: false, message: 'Formato data non corretto'});
    });

    test('POST /api/v2/event/create con data di fine precedente alla data di inizio', () => {
      return request(app)
        .post('/api/v2/event/create')
        .set('Accept', 'application/json')
        .send({
            token: token,
            name: 'NomeTest',
            description: 'DescrizioneTest',
            dstart: '2022-02-18',
            dend: '2022-01-19',
            address: 'via Test 42',
            city: 'Trento',
            total: '120',
            idCategoria: '627fd7ef95b0619bf9e9770f',
            userId: '62897b4e22fb362b808d3910'
        })
        .expect(400, {success: false, message: 'La data di fine disponibilità è precedente alla data di inizio'});
    });

    test('POST /api/v2/event/create con categoria non presente nel DB', async () => {
      return request(app)
        .post('/api/v2/event/create')
        .set('Accept', 'application/json')
        .send({
            token: token,
            name: 'NomeTest',
            description: 'DescrizioneTest',
            dstart: '2022-01-18',
            dend: '2022-02-02',
            address: 'via Test 42',
            city: 'Trento',
            total: '120',
            idCategoria: '627fd7ef95b0619bf9e1110f',
            userId: '62897b4e22fb362b808d3910'
        })
        .expect(400, {success: false, message: 'La categoria non è presente nel DB'});
    });

    test('POST /api/v2/event/create con utente loggato turista', () => {
      return request(app)
        .post('/api/v2/event/create')
        .set('Accept', 'application/json')
        .send({
            token: token,
            name: 'NomeTest',
            description: 'DescrizioneTest',
            dstart: '2022-01-18',
            dend: '2022-02-02',
            address: 'via Test 42',
            city: 'Trento',
            total: '120',
            idCategoria: '627fd7ef95b0619bf9e9770f',
            userId: '627fdb1d95b0619bf9e97711'
        })
        .expect(400, {success: false, message: 'L\'utente non è un gestore'});
    });

    test('POST /api/v2/event/create con dati e token conformi e corretti', () => {
      return request(app)
        .post('/api/v2/event/create')
        .set('Accept', 'application/json')
        .send({
            token: token,
            name: 'NomeTest',
            description: 'DescrizioneTest',
            dstart: '2022-01-18',
            dend: '2022-02-02',
            address: 'via Test 42',
            city: 'Trento',
            total: '120',
            idCategoria: '627fd7ef95b0619bf9e9770f',
            userId: '62897b4e22fb362b808d3910'
        })
        .expect(200, {success: true, message: 'Evento creato correttamente!'});
    });
});
