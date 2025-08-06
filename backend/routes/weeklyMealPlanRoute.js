const express = require('express');
const router = express.Router();
const {
    createWeeklyMealPlan,
    getUserMealPlans,
    getMealPlan,
    addMealToDay,
    generateShoppingLists,
    generateHelperInstructions,
    getMeatRecommendations
} = require('../controllers/weeklyMealPlanController');
const { protect } = require('../middleware/authMiddleware');

// Weekly meal plan routes
router.route('/')
    .post(protect, createWeeklyMealPlan)
    .get(protect, getUserMealPlans);

router.route('/:id')
    .get(protect, getMealPlan);

router.route('/:id/meals')
    .post(protect, addMealToDay);

router.route('/:id/shopping-lists')
    .post(protect, async (req, res) => {
        try {
            const updatedPlan = await generateShoppingLists(req.params.id);
            res.json(updatedPlan);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

router.route('/:id/helper-instructions/:day')
    .post(protect, generateHelperInstructions);

router.route('/recommendations/:meatType')
    .get(protect, getMeatRecommendations);

module.exports = router;