const express = require('express');
const router = express.Router();
const Event = require('./models/event'); // get our mongoose model




/**
 * Resource representation based on the following the pattern:
 * https://cloud.google.com/blog/products/application-development/api-design-why-you-should-use-links-not-keys-to-represent-relationships-in-apis
 */
router.get('/eventi', async (req, res) => {
    let events = await Event.find().exec();
    res.status(200).json(events);
});

module.exports = router;
