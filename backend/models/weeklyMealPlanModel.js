const mongoose = require('mongoose');

const mealSchema = {
    recipeId: {
        type: mongoose.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        required: true
    },
    servings: {
        type: Number,
        default: 4
    },
    preparationNotes: String,
    helperInstructions: String
};

const dayMealSchema = {
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    meals: [mealSchema]
};

const weeklyMealPlanSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekStartDate: {
        type: Date,
        required: true
    },
    weekEndDate: {
        type: Date,
        required: true
    },
    dailyMeals: [dayMealSchema],
    
    // Grocery shopping configuration
    shoppingDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: ['Tuesday', 'Saturday']
    }],
    
    // Generated shopping lists for the week
    firstShoppingList: [{
        name: String,
        quantity: Number,
        unit: String,
        category: String,
        estimatedCost: Number,
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium'
        }
    }],
    
    secondShoppingList: [{
        name: String,
        quantity: Number,
        unit: String,
        category: String,
        estimatedCost: Number,
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium'
        }
    }],
    
    // Meal preference tracking
    preferredMeatTypes: [{
        type: String,
        enum: ['Chicken', 'Beef', 'Fish', 'Pork', 'Turkey', 'Lamb', 'Seafood', 'Vegetarian'],
        default: ['Chicken', 'Beef', 'Fish']
    }],
    
    // Helper instructions for the week
    weeklyHelperInstructions: String,
    
    // Nutritional goals
    nutritionalGoals: {
        caloriesPerDay: {
            type: Number,
            default: 2000
        },
        proteinGoal: {
            type: Number,
            default: 150
        },
        carbGoal: {
            type: Number,
            default: 250
        },
        fatGoal: {
            type: Number,
            default: 70
        }
    },
    
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Completed'],
        default: 'Draft'
    }
}, {
    timestamps: true
});

// Index for efficient querying
weeklyMealPlanSchema.index({ userId: 1, weekStartDate: 1 });

const WeeklyMealPlan = mongoose.model('WeeklyMealPlan', weeklyMealPlanSchema);
module.exports = WeeklyMealPlan;