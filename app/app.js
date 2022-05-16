const express = require('express');
const visualizzazione = require('./visualizzazione.js');
const app = express();

/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('../api/v1/visualizzazione', visualizzazione);


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
