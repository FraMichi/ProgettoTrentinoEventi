const express = require('express');
const visualizzazione = require('./visualizzazione.js');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Trentino Eventi",
            description: "L’applicazione TRENTINO EVENTI è pensata per progettare vacanze sul territorio trentino. I turisti potranno utilizzare l’applicazione per visualizzare gli eventi in corso sul territorio e gli alloggi disponibili. Se il turista è registrato alla piattaforma potrà iscriversi/disiscriversi agli eventi oppure effettuare/disdire prenotazioni per gli alloggi. Potrà inoltre visualizzare la lista di eventi a cui è iscritto, la lista di alloggi prenotati e la lista dei trasporti in trentino. Come ultima cosa, potrà lasciare delle recensioni agli eventi a cui ha partecipato e agli alloggi in cui ha soggiornato. L’applicazione offre anche ai gestori la possibilità di pubblicare annunci per i propri eventi e mettere a disposizione i loro alloggi, in modo che possano essere prenotati dai turisti. Il gestore potrà annullare gli eventi da lui creati e togliere la disponibilità dei suoi alloggi oltre a poter rispondere ad eventuali recensioni",
            servers: ["http://localhost:8080/"]
        }
    },
    apis: ["./app/visualizzazione.js"]
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/v1/visualizzazione', visualizzazione);


/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;
