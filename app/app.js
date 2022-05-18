const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const authentication = require('./authentication.js');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/accommodation/create', authentication);


app.use('/', express.static('static'));

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;
