const express = require('express');
const router = express.Router();
const {
    getMeatRecommendations,
    getRecommendationsByMeat,
    getRecommendationDetails,
    createMeatRecommendation,
    getBalancedMealSuggestions,
    generateHelperInstructions
} = require('../controllers/meatRecommendationController');

// Public routes
router.route('/')
    .get(getMeatRecommendations)
    .post(createMeatRecommendation);

router.route('/by-meat/:meatType')
    .get(getRecommendationsByMeat);

router.route('/balanced-meal/:meatType')
    .get(getBalancedMealSuggestions);

router.route('/:id')
    .get(getRecommendationDetails);

router.route('/:id/helper-instructions')
    .get(generateHelperInstructions);

module.exports = router;