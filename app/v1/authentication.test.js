const request  = require('supertest');
const app      = require('./../app.js');
const jwt      = require('jsonwebtoken');

describe('POST /api/v1/authentication/login', () => {

    beforeAll( async () => {
        const User = require('./../models/user');
        newUserSpy = jest.spyOn(User, 'findOne').mockImplementation((criterias) => {
            if(criterias['email'] == "mario.rossi@gmail.com") {
                return {
                    _id: "627fdb1d95b0619bf9e97711",
                    nome: "Mario",
                    cognome: "Rossi",
                    dataDiNascita: "1990-05-18T00:00:00Z",
                    email: "mario.rossi@gmail.com",
                    password: "123",
                    tipoDiUtente: "turista"
                };
            }
            return undefined;
        });
    });

    afterAll( () => {
        newUserSpy.mockRestore();
    });

    var payload = {
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
            .expect(200, {
                success: false,
                message: 'Password sbagliata',
                token: null,
                name: null,
                id: null,
                expireTime: null
            });
    });

    test('POST /api/v1/authentication/login con credenziali corrette', () => {
        return request(app)
            .post('/api/v1/authentication/login')
            .set('Accept', 'application/json')
            .send({ email: 'mario.rossi@gmail.com', password: "123" })
            .expect(200, {
                success: true,
                message: 'Login effettuato',
                token: token,
                name: 'Mario',
                id: "627fdb1d95b0619bf9e97711",
                expireTime: expire
            });
    });

});


describe('POST /api/v1/authentication/subscribe con credenziali corrette', () => {

    beforeAll( async () => {
        const User = require('./../models/user');
        newUserFindOneSpy = jest.spyOn(User, 'findOne').mockImplementation((criterias) => {
            if(criterias['email'] == "mario.rossi@gmail.com") {
                return {
                    _id: "627fdb1d95b0619bf9e97711",
                    nome: "Mario",
                    cognome: "Rossi",
                    dataDiNascita: "1990-05-18T00:00:00Z",
                    email: "mario.rossi@gmail.com",
                    password: "123",
                    tipoDiUtente: "turista"
                };
            }
            return undefined;
        });
        newUserCreateSpy = jest.spyOn(User, 'create').mockImplementation((criterias) => {
          return {
              _id: "627fdb1d95b0619bf9e97711",
              nome: "gigi",
              cognome: "rossi",
              dataDiNascita: "1990-02-13",
              email: "gigi.rossi@gmail.com",
              password: "123",
              tipoDiUtente: "turista"
          };
        });
    });

    afterAll( () => {
        newUserSpy.mockRestore();
    });

    var payload = {
    		name: "gigi",
    		surname: "rossi",
    		birthdate: "1990-02-13",
    		email: "gigi.rossi@gmail.com",
    		userType: "turista",
            id: "627fdb1d95b0619bf9e97711"
  	}

    var expire = 1800;

    var token = jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: expire});

    test('POST /api/v1/authentication/subscribe con credenziali corrette', () => {
        return request(app)
        .post('/api/v1/authentication/subscribe')
        .set('Accept', 'application/json')
        .send({
            name: "gigi",
            surname: "rossi",
            birthdate: "1990-02-13",
            email: "gigi.rossi@gmail.com",
            password: "123",
            userType: "turista"
        })
        .expect(201, {
            success: true,
            token: token,
            name: "gigi",
            id: "627fdb1d95b0619bf9e97711",
            expireTime: expire
        });
    });
});
