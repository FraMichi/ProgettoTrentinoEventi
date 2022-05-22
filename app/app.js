const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require("cookie-parser");


const visualizzazione = require('./visualizzazione.js');
const authentication = require('./authentication.js');
const eventSubscription = require("./eventSubscription.js");
const housingSubscription = require("./housingSubscription.js");

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
  apis: ['./app/authentication.js', './app/visualizzazione.js', './app/eventSubscription.js', './app/housingSubscription.js'] // files containing annotations as above
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

app.use('/api/v1/eventSubscription', eventSubscription);
app.use('/api/v1/housingSubscription', housingSubscription);

app.use('/', express.static('static'));


app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;
