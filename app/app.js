const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require("cookie-parser");

const visualizzazione = require('./v1/visualizzazione.js');
const authentication = require('./v1/authentication.js');
const eventSubscription = require("./v1/eventSubscription.js");
const accommodation = require('./v1/accommodation.js');
const evento = require('./v1/event.js');
const housingSubscription = require("./v1/housingSubscription.js");
const getCreatedEntries = require("./v2/getCreatedEntries.js");
const visualizzazioneV2 = require('./v2/visualizzazione.js');

const elimination = require("./v2/elimination.js");
const visualizzazioneFiltrata = require("./v2/visualizzazioneFiltrata.js");
const review = require('./v2/review.js');
const visualizzazioneReview = require('./v2/visualizzazioneReview.js');

var fs = require('fs');
const app = express();

// Opzioni per la documentazione
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trentino Eventi',
      description: 'Applicazione che mostra eventi ed alloggi in Trentino',
      version: '1.0.0'
    },
    servers: {
      url: {
        http:"//localhost:8080/",
        description: "Localhost"
      }
    }
  },
  apis: ['./app/v1/authentication.js', './app/v1/visualizzazione.js', './app/v1/eventSubscription.js', './app/v1/housingSubscription.js', './app/v1/accommodation.js', './app/v1/event.js', './app/v2/getCreatedEntries.js', './app/v2/visualizzazione.js', './app/v2/elimination.js', './app/v2/visualizzazioneFiltrata.js'] // files containing annotations as above
};

// Si crea il documento della documentazione
const swaggerDocument = swaggerJsDoc(swaggerOptions);

// Scrive nel file 'swagger.yaml' la documentazione così che poi sia visibile su apiary
fs.writeFile('./swagger.yaml', JSON. stringify(swaggerDocument), (err) => {
    if (err){
        console.log(err);
    }
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/visualizzazione', visualizzazione);
app.use('/api/v1/authentication', authentication);
app.use('/api/v1/accommodation', accommodation);
app.use('/api/v1/event', evento);
app.use('/api/v1/eventSubscription', eventSubscription);
app.use('/api/v1/housingSubscription', housingSubscription);

app.use('/api/v2/visualizzazioneFiltrata', visualizzazioneFiltrata);
app.use('/api/v2/getCreatedEntries', getCreatedEntries);
app.use('/api/v2/visualizzazione', visualizzazioneV2);
app.use('/api/v2/elimination', elimination);
app.use('/api/v2/review', review);
app.use('/api/v2/visualizzazioneReview', visualizzazioneReview);

app.use('/', express.static('static'));

app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;
