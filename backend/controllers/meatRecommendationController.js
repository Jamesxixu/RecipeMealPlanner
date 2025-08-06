const asyncHandler = require('express-async-handler');
const MeatRecommendation = require('../models/meatRecommendationModel');

// @desc    Get all meat recommendations
// @route   GET /api/meat-recommendations
// @access  Public
const getMeatRecommendations = asyncHandler(async (req, res) => {
    const { meatType, difficulty, cuisine, healthScore } = req.query;
    
    let filter = {};
    
    if (meatType) filter.meatType = meatType;
    if (difficulty) filter['recipeSummary.difficulty'] = difficulty;
    if (cuisine) filter.cuisine = new RegExp(cuisine, 'i');
    if (healthScore) filter.healthScore = { $gte: parseInt(healthScore) };
    
    const recommendations = await MeatRecommendation.find(filter)
        .sort({ healthScore: -1, popularityScore: -1 });
    
    res.json(recommendations);
});

// @desc    Get recommendations by meat type
// @route   GET /api/meat-recommendations/by-meat/:meatType
// @access  Public
const getRecommendationsByMeat = asyncHandler(async (req, res) => {
    const { meatType } = req.params;
    const { limit = 5 } = req.query;
    
    const recommendations = await MeatRecommendation.find({ meatType })
        .sort({ healthScore: -1, popularityScore: -1 })
        .limit(parseInt(limit));
    
    res.json(recommendations);
});

// @desc    Get recommendation details
// @route   GET /api/meat-recommendations/:id
// @access  Public
const getRecommendationDetails = asyncHandler(async (req, res) => {
    const recommendation = await MeatRecommendation.findById(req.params.id);
    
    if (!recommendation) {
        res.status(404);
        throw new Error('Recommendation not found');
    }
    
    res.json(recommendation);
});

// @desc    Create a new meat recommendation
// @route   POST /api/meat-recommendations
// @access  Private (Admin)
const createMeatRecommendation = asyncHandler(async (req, res) => {
    const recommendation = await MeatRecommendation.create(req.body);
    res.status(201).json(recommendation);
});

// @desc    Get balanced meal suggestions for meat type
// @route   GET /api/meat-recommendations/balanced-meal/:meatType
// @access  Public
const getBalancedMealSuggestions = asyncHandler(async (req, res) => {
    const { meatType } = req.params;
    const { servings = 4, dietaryRestrictions } = req.query;
    
    let filter = { meatType };
    
    // Apply dietary restrictions
    if (dietaryRestrictions) {
        const restrictions = dietaryRestrictions.split(',');
        // Add logic for dietary restrictions if needed
    }
    
    const recommendations = await MeatRecommendation.find(filter)
        .sort({ healthScore: -1 })
        .limit(3);
    
    // Enhance recommendations with balanced meal components
    const balancedMeals = recommendations.map(rec => ({
        ...rec.toObject(),
        adjustedServings: parseInt(servings),
        balancedMealPlan: {
            protein: {
                name: rec.primaryProtein.name,
                quantity: calculateProteinQuantity(rec.meatType, servings),
                cookingMethod: rec.primaryProtein.cookingMethod
            },
            vegetables: rec.balancedMealComponents.vegetables.map(veg => ({
                ...veg,
                quantity: (veg.quantity * servings / 4)
            })),
            carbohydrates: rec.balancedMealComponents.carbohydrates.map(carb => ({
                ...carb,
                quantity: (carb.quantity * servings / 4)
            })),
            estimatedNutrition: calculateNutritionForServings(rec.nutritionPerServing, servings)
        }
    }));
    
    res.json(balancedMeals);
});

// @desc    Generate helper instructions for specific recommendation
// @route   GET /api/meat-recommendations/:id/helper-instructions
// @access  Public
const generateHelperInstructions = asyncHandler(async (req, res) => {
    const { servings = 4 } = req.query;
    const recommendation = await MeatRecommendation.findById(req.params.id);
    
    if (!recommendation) {
        res.status(404);
        throw new Error('Recommendation not found');
    }
    
    let instructions = `🍽️ **Cooking Instructions: ${recommendation.recipeSummary.title}**\n\n`;
    instructions += `**Servings:** ${servings} people\n`;
    instructions += `**Prep Time:** ${recommendation.recipeSummary.prepTime} minutes\n`;
    instructions += `**Cook Time:** ${recommendation.recipeSummary.cookTime} minutes\n`;
    instructions += `**Difficulty:** ${recommendation.recipeSummary.difficulty}\n\n`;
    
    instructions += `## Ingredients Needed\n\n`;
    
    // Protein
    const proteinQty = calculateProteinQuantity(recommendation.meatType, servings);
    instructions += `### Main Protein\n`;
    instructions += `- ${proteinQty}g ${recommendation.primaryProtein.name} (${recommendation.primaryProtein.cut})\n\n`;
    
    // Vegetables
    instructions += `### Vegetables\n`;
    recommendation.balancedMealComponents.vegetables.forEach(veg => {
        const adjustedQty = (veg.quantity * servings / 4).toFixed(1);
        instructions += `- ${adjustedQty} ${veg.unit} ${veg.name}\n`;
    });
    instructions += `\n`;
    
    // Carbohydrates
    instructions += `### Carbohydrates\n`;
    recommendation.balancedMealComponents.carbohydrates.forEach(carb => {
        const adjustedQty = (carb.quantity * servings / 4).toFixed(1);
        instructions += `- ${adjustedQty} ${carb.unit} ${carb.name}\n`;
    });
    instructions += `\n`;
    
    // Seasonings
    instructions += `### Seasonings\n`;
    recommendation.balancedMealComponents.seasonings.forEach(seasoning => {
        const adjustedQty = (seasoning.quantity * servings / 4).toFixed(1);
        instructions += `- ${adjustedQty} ${seasoning.unit} ${seasoning.name}\n`;
    });
    instructions += `\n`;
    
    instructions += `## Step-by-Step Instructions\n\n`;
    
    // Preparation
    instructions += `### Preparation\n`;
    recommendation.detailedInstructions.preparation.forEach((step, index) => {
        instructions += `${index + 1}. ${step}\n`;
    });
    instructions += `\n`;
    
    // Cooking
    instructions += `### Cooking\n`;
    recommendation.detailedInstructions.cooking.forEach((step, index) => {
        instructions += `${index + 1}. ${step}\n`;
    });
    instructions += `\n`;
    
    // Plating
    if (recommendation.detailedInstructions.plating.length > 0) {
        instructions += `### Plating\n`;
        recommendation.detailedInstructions.plating.forEach((step, index) => {
            instructions += `${index + 1}. ${step}\n`;
        });
        instructions += `\n`;
    }
    
    // Tips
    if (recommendation.detailedInstructions.tips.length > 0) {
        instructions += `## Pro Tips 💡\n`;
        recommendation.detailedInstructions.tips.forEach(tip => {
            instructions += `- ${tip}\n`;
        });
        instructions += `\n`;
    }
    
    // Helper-specific instructions
    instructions += `## Helper Instructions 👨‍🍳\n\n`;
    if (recommendation.helperInstructions.simplified) {
        instructions += `**Quick Summary:** ${recommendation.helperInstructions.simplified}\n\n`;
    }
    
    if (recommendation.helperInstructions.timingNotes) {
        instructions += `**Timing Notes:** ${recommendation.helperInstructions.timingNotes}\n\n`;
    }
    
    if (recommendation.helperInstructions.importantTips.length > 0) {
        instructions += `**Important Tips:**\n`;
        recommendation.helperInstructions.importantTips.forEach(tip => {
            instructions += `- ${tip}\n`;
        });
        instructions += `\n`;
    }
    
    instructions += `**Estimated Total Time:** ${recommendation.recipeSummary.prepTime + recommendation.recipeSummary.cookTime} minutes\n\n`;
    instructions += `*Instructions generated for ${servings} servings*`;
    
    res.json({
        recipeTitle: recommendation.recipeSummary.title,
        instructions,
        servings: parseInt(servings),
        totalTime: recommendation.recipeSummary.prepTime + recommendation.recipeSummary.cookTime,
        difficulty: recommendation.recipeSummary.difficulty,
        nutritionInfo: calculateNutritionForServings(recommendation.nutritionPerServing, servings)
    });
});

// Helper functions
const calculateProteinQuantity = (meatType, servings) => {
    const baseQuantities = {
        'Chicken': 150, // grams per person
        'Beef': 120,
        'Fish': 140,
        'Pork': 130,
        'Turkey': 150,
        'Lamb': 120,
        'Seafood': 140
    };
    
    return (baseQuantities[meatType] || 140) * servings;
};

const calculateNutritionForServings = (nutritionPerServing, servings) => {
    if (!nutritionPerServing) return null;
    
    return {
        calories: Math.round(nutritionPerServing.calories * servings),
        protein: Math.round(nutritionPerServing.protein * servings),
        carbohydrates: Math.round(nutritionPerServing.carbohydrates * servings),
        fat: Math.round(nutritionPerServing.fat * servings),
        fiber: Math.round(nutritionPerServing.fiber * servings),
        sodium: Math.round(nutritionPerServing.sodium * servings)
    };
};

module.exports = {
    getMeatRecommendations,
    getRecommendationsByMeat,
    getRecommendationDetails,
    createMeatRecommendation,
    getBalancedMealSuggestions,
    generateHelperInstructions
};