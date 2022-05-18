const express = require('express');
const visualizzazione = require('./visualizzazione.js');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Trentino Eventi",
            description: "lorem ipsum dolor sit amet",
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
