const asyncHandler = require('express-async-handler');
const WeeklyMealPlan = require('../models/weeklyMealPlanModel');
const Recipe = require('../models/recipeModel');
const MeatRecommendation = require('../models/meatRecommendationModel');

// @desc    Create a new weekly meal plan
// @route   POST /api/meal-plans
// @access  Private
const createWeeklyMealPlan = asyncHandler(async (req, res) => {
    const { weekStartDate, weekEndDate, preferredMeatTypes, nutritionalGoals, shoppingDays } = req.body;
    
    const weeklyPlan = await WeeklyMealPlan.create({
        userId: req.user._id,
        weekStartDate: new Date(weekStartDate),
        weekEndDate: new Date(weekEndDate),
        preferredMeatTypes: preferredMeatTypes || ['Chicken', 'Beef', 'Fish'],
        nutritionalGoals,
        shoppingDays: shoppingDays || ['Tuesday', 'Saturday'],
        dailyMeals: []
    });
    
    res.status(201).json(weeklyPlan);
});

// @desc    Get user's meal plans
// @route   GET /api/meal-plans
// @access  Private
const getUserMealPlans = asyncHandler(async (req, res) => {
    const mealPlans = await WeeklyMealPlan.find({ userId: req.user._id })
        .populate('dailyMeals.meals.recipeId')
        .sort({ weekStartDate: -1 });
    
    res.json(mealPlans);
});

// @desc    Get a specific meal plan
// @route   GET /api/meal-plans/:id
// @access  Private
const getMealPlan = asyncHandler(async (req, res) => {
    const mealPlan = await WeeklyMealPlan.findById(req.params.id)
        .populate('dailyMeals.meals.recipeId');
    
    if (!mealPlan || mealPlan.userId.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Meal plan not found');
    }
    
    res.json(mealPlan);
});

// @desc    Add meal to a specific day
// @route   POST /api/meal-plans/:id/meals
// @access  Private
const addMealToDay = asyncHandler(async (req, res) => {
    const { day, recipeId, mealType, servings, preparationNotes } = req.body;
    
    const mealPlan = await WeeklyMealPlan.findById(req.params.id);
    
    if (!mealPlan || mealPlan.userId.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Meal plan not found');
    }
    
    // Find or create the day entry
    let dayEntry = mealPlan.dailyMeals.find(d => d.day === day);
    if (!dayEntry) {
        dayEntry = { day, meals: [] };
        mealPlan.dailyMeals.push(dayEntry);
    }
    
    // Add the meal
    dayEntry.meals.push({
        recipeId,
        mealType,
        servings: servings || 4,
        preparationNotes
    });
    
    await mealPlan.save();
    
    // Regenerate shopping lists
    await generateShoppingLists(mealPlan._id);
    
    res.json(mealPlan);
});

// @desc    Generate shopping lists for the week
// @route   POST /api/meal-plans/:id/shopping-lists
// @access  Private
const generateShoppingLists = asyncHandler(async (mealPlanId) => {
    const mealPlan = await WeeklyMealPlan.findById(mealPlanId)
        .populate('dailyMeals.meals.recipeId');
    
    if (!mealPlan) {
        throw new Error('Meal plan not found');
    }
    
    const allIngredients = {};
    
    // Collect all ingredients from all meals
    mealPlan.dailyMeals.forEach(day => {
        day.meals.forEach(meal => {
            if (meal.recipeId && meal.recipeId.ingredients) {
                meal.recipeId.ingredients.forEach(ingredient => {
                    const key = `${ingredient.name}-${ingredient.unit}`;
                    if (allIngredients[key]) {
                        allIngredients[key].quantity += ingredient.quantity * (meal.servings / 4);
                    } else {
                        allIngredients[key] = {
                            name: ingredient.name,
                            quantity: ingredient.quantity * (meal.servings / 4),
                            unit: ingredient.unit,
                            category: ingredient.category,
                            priority: getPriority(ingredient.category)
                        };
                    }
                });
            }
        });
    });
    
    // Split ingredients between two shopping trips
    const ingredientsList = Object.values(allIngredients);
    const firstShoppingList = [];
    const secondShoppingList = [];
    
    // Categorize by perishability and shopping frequency
    ingredientsList.forEach(ingredient => {
        if (isPerishable(ingredient.category) || ingredient.priority === 'High') {
            // Split perishables between both trips
            if (ingredient.category === 'Dairy' || ingredient.category === 'Vegetables') {
                const halfQuantity = Math.ceil(ingredient.quantity / 2);
                firstShoppingList.push({
                    ...ingredient,
                    quantity: halfQuantity
                });
                secondShoppingList.push({
                    ...ingredient,
                    quantity: ingredient.quantity - halfQuantity
                });
            } else {
                secondShoppingList.push(ingredient); // Fresh items for second trip
            }
        } else {
            firstShoppingList.push(ingredient); // Non-perishables for first trip
        }
    });
    
    // Update the meal plan with shopping lists
    mealPlan.firstShoppingList = firstShoppingList;
    mealPlan.secondShoppingList = secondShoppingList;
    
    await mealPlan.save();
    return mealPlan;
});

// @desc    Generate helper instructions for next day
// @route   POST /api/meal-plans/:id/helper-instructions/:day
// @access  Private
const generateHelperInstructions = asyncHandler(async (req, res) => {
    const { day } = req.params;
    const mealPlan = await WeeklyMealPlan.findById(req.params.id)
        .populate('dailyMeals.meals.recipeId');
    
    if (!mealPlan || mealPlan.userId.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Meal plan not found');
    }
    
    const dayEntry = mealPlan.dailyMeals.find(d => d.day === day);
    if (!dayEntry) {
        res.status(404);
        throw new Error('No meals planned for this day');
    }
    
    let instructions = `📋 **Meal Preparation Instructions for ${day}**\n\n`;
    instructions += `Dear Helper,\n\nHere are today's meal preparation instructions:\n\n`;
    
    // Group meals by type
    const mealsByType = {
        Breakfast: [],
        Lunch: [],
        Dinner: [],
        Snack: []
    };
    
    dayEntry.meals.forEach(meal => {
        if (meal.recipeId) {
            mealsByType[meal.mealType].push(meal);
        }
    });
    
    // Generate instructions for each meal type
    Object.keys(mealsByType).forEach(mealType => {
        if (mealsByType[mealType].length > 0) {
            instructions += `## ${mealType}\n\n`;
            
            mealsByType[mealType].forEach((meal, index) => {
                const recipe = meal.recipeId;
                instructions += `### ${index + 1}. ${recipe.name} (${meal.servings} servings)\n\n`;
                
                if (meal.preparationNotes) {
                    instructions += `**Special Notes:** ${meal.preparationNotes}\n\n`;
                }
                
                // Simplified ingredient list
                instructions += `**Ingredients needed:**\n`;
                recipe.ingredients.forEach(ingredient => {
                    const adjustedQuantity = (ingredient.quantity * meal.servings / 4).toFixed(1);
                    instructions += `- ${adjustedQuantity} ${ingredient.unit} ${ingredient.name}\n`;
                });
                
                instructions += `\n**Preparation Steps:**\n`;
                if (recipe.instruction) {
                    // Simplify instructions for helper
                    const steps = recipe.instruction.split(/\d+\.|\n/).filter(step => step.trim());
                    steps.forEach((step, stepIndex) => {
                        if (step.trim()) {
                            instructions += `${stepIndex + 1}. ${step.trim()}\n`;
                        }
                    });
                } else {
                    instructions += `1. Follow the recipe for ${recipe.name}\n`;
                    instructions += `2. Prepare ${meal.servings} servings\n`;
                    instructions += `3. Let me know when ready\n`;
                }
                
                instructions += `\n⏰ **Estimated prep time:** ${recipe.prepTime || 30} minutes\n`;
                instructions += `⏰ **Estimated cook time:** ${recipe.cookTime || 30} minutes\n\n`;
                instructions += `---\n\n`;
            });
        }
    });
    
    instructions += `## General Guidelines\n\n`;
    instructions += `- Please start preparations 2 hours before meal time\n`;
    instructions += `- Wash all vegetables and fruits before use\n`;
    instructions += `- Keep cooked food warm until serving\n`;
    instructions += `- Clean as you go to maintain a tidy kitchen\n`;
    instructions += `- Call me if you have any questions\n\n`;
    instructions += `Thank you for your help! 🙏\n\n`;
    instructions += `*Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*`;
    
    res.json({
        day,
        instructions,
        mealsCount: dayEntry.meals.length,
        estimatedTotalTime: dayEntry.meals.reduce((total, meal) => {
            return total + (meal.recipeId.prepTime || 30) + (meal.recipeId.cookTime || 30);
        }, 0)
    });
});

// @desc    Get meat-based meal recommendations
// @route   GET /api/meal-plans/recommendations/:meatType
// @access  Private
const getMeatRecommendations = asyncHandler(async (req, res) => {
    const { meatType } = req.params;
    const { difficulty, maxPrepTime } = req.query;
    
    let query = { meatType };
    
    if (difficulty) {
        query['recipeSummary.difficulty'] = difficulty;
    }
    
    if (maxPrepTime) {
        query['recipeSummary.prepTime'] = { $lte: parseInt(maxPrepTime) };
    }
    
    const recommendations = await MeatRecommendation.find(query)
        .sort({ healthScore: -1, popularityScore: -1 })
        .limit(10);
    
    res.json(recommendations);
});

// Helper functions
const getPriority = (category) => {
    const highPriorityCategories = ['Chicken', 'Beef', 'Fish', 'Seafood', 'Dairy'];
    const mediumPriorityCategories = ['Vegetables', 'Fruits'];
    
    if (highPriorityCategories.includes(category)) return 'High';
    if (mediumPriorityCategories.includes(category)) return 'Medium';
    return 'Low';
};

const isPerishable = (category) => {
    const perishableCategories = ['Dairy', 'Vegetables', 'Fruits', 'Chicken', 'Beef', 'Fish', 'Seafood'];
    return perishableCategories.includes(category);
};

module.exports = {
    createWeeklyMealPlan,
    getUserMealPlans,
    getMealPlan,
    addMealToDay,
    generateShoppingLists,
    generateHelperInstructions,
    getMeatRecommendations
};