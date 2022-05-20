const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
var fs = require('fs');

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const authentication = require('./authentication.js');
const accommodation = require('./accommodation.js');


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
  apis: ['./app/authentication.js'] // files containing annotations as above
};

// Si crea il documento della documentazione
const swaggerDocument = swaggerJsDoc(swaggerOptions);

// Scrive nel file 'swagger.yaml' la documentazione così che poi sia visibile su apiary
fs.writeFile('./swagger.yaml', JSON. stringify(swaggerDocument), (err) => {
  if (err){
    console.log(err);
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/authentication', authentication);
app.use('/api/v1/accommodation', accommodation);
//app.use('/api/v1/event/create', authentication);


app.use('/', express.static('static'));


app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;
