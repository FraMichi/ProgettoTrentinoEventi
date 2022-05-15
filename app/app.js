const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const authentication = require('./authentication.js');


app.use(cookieParser());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/authentication', authentication);


app.use('/', express.static('static'));


app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;
