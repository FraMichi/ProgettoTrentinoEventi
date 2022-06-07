const request = require('supertest');
const app = require('./../app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Housing = require('./../models/housing');
const User = require('./../models/user');
const Event = require ('./../models/event');
const Category = require ('./../models/category');
const EventReview = require ('./../models/eventreview');
const HousingReview = require ('./../models/housingreview');

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

describe('POST /api/v2/visualizzazioneReview/EventReview', () => {

    beforeAll( async () => {
         jest.setTimeout(8000);

         //Crea mock.function per find in Event
             eventItemSpy = jest.spyOn(Event, 'findOne').mockImplementation((crit) => {
                if(crit["_id"] == "62897c3d3d0c2508a888588f")
                {
                    return {
                        _id: "62897c3d3d0c2508a888588f",
                        titolo: "Partita di pallavolo",
                        descrizione: "Coppa Italia di pallavolo femminile",
                        dataInizio: "2022-05-29T00:00:00.000+00:00",
                        dataFine: "2022-05-29T00:00:00.000+00:00",
                        indirizzo: "Viale Italia n.5, Rovereto, TN, Italia",
                        citta: "Rovereto",
                        postiDisponibili: 1994,
                        postiTotali: 2000,
                        idCategoria: "627fd7ef95b0619bf9e9770f",
                        idGestore: "62897b4e22fb362b808d3910"
                    };
                } else if (crit["_id"] == "62897c3d3d0c2508a888588g")
                {
                    return {
                        _id: "62897c3d3d0c2508a888588g",
                        titolo: "Partita di pallavolo",
                        descrizione: "Coppa Italia di pallavolo femminile",
                        dataInizio: "2022-05-29T00:00:00.000+00:00",
                        dataFine: "2022-05-29T00:00:00.000+00:00",
                        indirizzo: "Viale Italia n.5, Rovereto, TN, Italia",
                        citta: "Rovereto",
                        postiDisponibili: 1994,
                        postiTotali: 2000,
                        idCategoria: "627fd7ef95b0619bf9e9770f",
                        idGestore: "62897b4e22fb362b808d3910"
                    };
                } else {return []}
            });

            //Crea mock.function per find in Event
                eventReviewItemSpy = jest.spyOn(EventReview, 'find').mockImplementation((crit) => {
                   if(crit["idEvento"] == "62838c1f3ba701dd200682e9")
                   {
                       return {
                           recensione:,
                           risposta:
                       };
                   } else {return []}
               });

               afterAll(() => {
               eventItemSpy.mockRestore();
               eventReviewItemSpy.mockRestore();
          });

      // token non valido
      test('POST /api/v2/visualizzazioneReview/createEventReview con token non valido', () => {
          return request(app).post('/api/v2/visualizzazioneReview/createEventReview')
          .send({token: tokenNoV, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
          .expect(401, {
              success: false,
              message: 'UserNotLogged'
          });
      });

      // token ok, id evento non conforme
      test('POST /api/v2/visualizzazioneReview/createEventReview con token valido ma id evento non conforme', () => {
          return request(app).post('/api/v2/visualizzazioneReview/createEventReview')
          .send({token: tokenVal, event:"62838c1fljfnsdlkfòksamlsd3ba701dd200672e9"}).set('Accept', 'application/json')
          .expect(400, {success: false, message: "MongoDBFormatException"});
      });

      // token ok, id evento non esistente
      test('POST /api/v2/visualizzazioneReview/createEventReview con token valido ma id evento non esistente', () => {
          return request(app).post('/api/v2/visualizzazioneReview/createEventReview')
          .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
          .expect(404, {
              success: false,
              message: "EventNotFound"
          });
      });

      // token ok, utente visualizza una recensione
      test('POST /api/v2/visualizzazioneReview/createEventReview con token valido e utente iscritto', () => {
          return request(app).post('/api/v2/visualizzazioneReview/createEventReview')
          .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
          .expect(200, {
              success: true,
              message: 'UserSubscribed'
          });
      });

      // token ok, utente non iscritto
      test('POST /api/v2/visualizzazioneReview/createEventReview con token valido e utente non iscritto', () => {
          return request(app).post('/api/v2/review/createEventReview')
          .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
          .expect(200, {
              success: true,
              message: 'UserNotSubscribed'
          });
      });

      // nessuna iscrizione ad evento
      test('POST /api/v2/review/createEventReview con nessuna iscrizione ad eventi', () => {
       return request(app).post('/api/v2/review/createEventReview')
         .send({token: tokenNoV}).set('Accept', 'application/json')
         .expect(200, {
              success: false,
              message: 'Non sei iscritto/a a nessun evento'
          });
     });

     // con iscrizione ad evento
     test('POST /api/v2/review/createEventReview con iscrizioni ad eventi', () => {
     return request(app).post('/api/v2/review/createEventReview')
       .send({ token: tokenVal}).set('Accept', 'application/json')
       .expect(200, reviewList);

   });
