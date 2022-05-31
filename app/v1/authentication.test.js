/**
 * https://www.npmjs.com/package/supertest
 */
const request  = require('supertest');
const app      = require('./../app.js');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('POST /api/v1/authentication/login', () => {

    let connection;

    beforeAll( async () => {
        jest.setTimeout(8000);
        jest.unmock('mongoose');
        connection = await  mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Database connected!');
    });

    afterAll( () => {
        mongoose.connection.close(true);
        console.log("Database connection closed");
    });


    var token = jwt.sign(
        {email: 'mario.rossi@gmail.com'},
        process.env.TOKEN_SECRET,
        {expiresIn: 86400}
    );

    test('POST /api/v1/authentication/login con utente non registrato', () => {
        return request(app)
            .post('/api/v1/authentication/login')
            .set('Accept', 'application/json')
            .send({ email: 'whatever@whatever.it', password: '12345' })
            .expect(404, { success: false, message: 'Utente non trovato' });
    });

    test('POST /api/v1/authentication/login con email mancante', () => {
        return request(app)
            .post('/api/v1/authentication/login')
            .set('Accept', 'application/json')
            .send({ email: undefined, password: '12345' })
            .expect(400, { success: false, message: 'Inserire tutti i campi' });
    });

    test('POST /api/v1/authentication/login con password mancante', () => {
        return request(app)
            .post('/api/v1/authentication/login')
            .set('Accept', 'application/json')
            .send({ email: 'whatever@whatever.it', password: undefined })
            .expect(400, { success: false, message: 'Inserire tutti i campi' });
    });

    test('POST /api/v1/authentication/login con email errata', () => {
        return request(app)
            .post('/api/v1/authentication/login')
            .set('Accept', 'application/json')
            .send({ email: 'email.errata@whatever.com', password: '12345' })
            .expect(404, { success: false, message: 'Utente non trovato' });
    });

    test('POST /api/v1/authentication/login con password errata', () => {
        return request(app)
            .post('/api/v1/authentication/login')
            .set('Accept', 'application/json')
            .send({ email: 'mario.rossi@gmail.com', password: "12345" })
            .expect(200, { success: false, message: 'Password sbagliata', token: null, name: null, id: null, expireTime: null });
    });

    test('POST /api/v1/authentication/login con credenziali corrette', () => {
        return request(app)
            .post('/api/v1/authentication/login')
            .set('Accept', 'application/json')
            .send({ email: 'mario.rossi@gmail.com', password: "123" })
            .expect(200, { success: true, message: 'Login effettuato', token: token, name: 'Mario', id: user._id, expireTime: expire });
    });

});
