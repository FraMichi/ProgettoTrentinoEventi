const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Housing = require('./../models/housing');
const User = require('./../models/user');
const Event = require ('./../models/event');
const Category = require ('./../models/category');
const EventReview = require ('./../models/eventreview');
const HousingReview = require ('./../models/housingreview');


/**
 * @openapi
 * /api/v2/review/eventReview:
 *   get:
 *     description: Gets the reviews of a specific event
 *     summary: Reviews of one event
 *     tags:
 *       - eventReviewsVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific event you want to get the details
 *         required: true
 *     responses:
 *       200:
 *         description: Reviews of an event in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 idUtente:
 *                   type: string
 *                   description: Id of the author of the review
 *                 message:
 *                   type: string
 *                   description: the review of the event
 *                 idGestore:
 *                   type: string
 *                   description: id of the creator of the event
 *                 answer:
 *                   type: string
 *                   description: the answer of the creator of the event
 *                 delete:
 *                   type: string
 *                   description: delete event review
 *       404:
 *         description: Some data are not found on the DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error
 *       400:
 *         description: The Id query parameter is not present or do not respect the MongoDB format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error
 */
router.get('/eventReview', async (req, res) => {

  let eventReview = await EventReview.find().exec();
  let listreview = eventReview.map((eventReview) => {return{review: review, answer: answer};})
  res.status(200).json(listreview);
});

/**
 * @openapi
 * /api/v2/review/housingReview:
 *   get:
 *     description: Gets the reviews of a specific housing
 *     summary: Reviews of one housing
 *     tags:
 *       - housingReviewVisualization
 *     parameters:
 *       - in: query
 *         name: id
 *         type: string
 *         description: The id of the specific housing you want to get the reviews
 *         required: true
 *     responses:
 *       200:
 *         description: Details of a housing in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 review:
 *                   type: string
 *                   description: title of the housing
 *                 answer:
 *                   type: string
 *                   description: answer of the housing owner
 *                 idAlloggio:
 *                   type: string
 *                   description: id of the house
 *                 idUtente:
 *                   type: string
 *                   description: id of the user who write the review
 *                 idGestore:
 *                   type: string
 *                   description: id of the user who can answer
 *       404:
 *         description: Some data are not found on the DB
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error specific error
 *       400:
 *         description: The Id query parameter is not present or do not respect the MongoDB format
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: specifications regarding the specific error
 */
router.get('/housingReview', async (req, res) => {

  let housingReview = await HousingReview.find().exec();
  let listreview = houingReview.map((housingReview) => {return{review: review, answer: answer};})
  res.status(200).json(listreview);
});

module.exports = router;
