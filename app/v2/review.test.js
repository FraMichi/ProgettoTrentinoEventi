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
const EventSubscription = require('./../models/eventsubscription');
const HousingSubscription = require('./../models/housingsubscription');

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


describe('POST /api/v2/review/createEventReview', () => {

    beforeAll( async () => {
         jest.setTimeout(8000);

    //Crea mock-function per findOne in EventSubscription
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
    //Crea mock.function per find in Event
        eventItemSpy = jest.spyOn(Event, 'findOne').mockImplementation((crit) => {
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

       // Empty stub
        eventReviewCreationSpy = jest.spyOn(EventReview, 'create').mockImplementation((crit) => {
            return {}
        });

   });
   afterAll(() => {
     eventSubSpy.mockRestore();
     eventItemSpy.mockRestore();
   });

   // token non valido
   test('POST /api/v2/review/createEventReview con token non valido', () => {
       return request(app).post('/api/v2/review/createEventReview')
       .send({token: tokenNoV, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
       .expect(400, {
           success: false,
           message: 'Parametri mancanti'
       });
   });

   // token ok, id evento non conforme
   test('POST /api/v2/review/createEventReview con token valido ma id evento non conforme', () => {
       return request(app).post('/api/v2/review/createEventReview')
       .send({token: tokenVal, event:"62838c1fljfnsdlkfòksamlsd3ba701dd200672e9"}).set('Accept', 'application/json')
       .expect(400, {success: false, message: "Parametri Mancanti"});
   });

   // token ok, id evento non esistente
   test('POST /api/v2/review/createEventReview con token valido ma id evento non esistente', () => {
       return request(app).post('/api/v2/review/createEventReview')
       .send({token: tokenVal, event:"62838c1f3ba701dd200672e9"}).set('Accept', 'application/json')
       .expect(400, {
           success: false,
           message: "Parametri mancanti"
       });
   });

   // token ok, utente lascia una recensione
   test('POST /api/v2/review/createEventReview con token valido e utente iscritto', () => {
       return request(app).post('/api/v2/review/createEventReview')
       .send({token: tokenVal, event:"62838c1f3ba701dd200682e9"}).set('Accept', 'application/json')
       .expect(200, {
           success: true,
           message: 'UserSubscribed'
       });
   });

   // token ok, utente non iscritto
   test('POST /api/v2/review/createEventReview con token valido e utente non iscritto', () => {
       return request(app).post('/api/v2/review/createEventReview')
       .send({token: tokenVal, event:"62838c1f3ba701dd200682e8"}).set('Accept', 'application/json')
       .expect(400, {
           success: true,
           message: 'Bad Request'
       });
   });

   // nessuna iscrizione ad evento
   test('POST /api/v2/review/createEventReview con nessuna iscrizione ad eventi', () => {
    return request(app).post('/api/v2/review/createEventReview')
      .send({token: tokenNoV}).set('Accept', 'application/json')
      .expect(400, {
           success: false,
           message: 'Parametri mancanti'
       });
  });
});
