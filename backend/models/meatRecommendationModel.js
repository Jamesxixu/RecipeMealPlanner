const mongoose = require('mongoose');

const nutritionInfoSchema = {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number,
    sodium: Number
};

const meatRecommendationSchema = mongoose.Schema({
    meatType: {
        type: String,
        enum: ['Chicken', 'Beef', 'Fish', 'Pork', 'Turkey', 'Lamb', 'Seafood'],
        required: true
    },
    
    primaryProtein: {
        name: String,
        cut: String, // e.g., "breast", "thigh", "sirloin", "salmon fillet"
        cookingMethod: {
            type: String,
            enum: ['Grilled', 'Baked', 'Pan-fried', 'Roasted', 'Steamed', 'Braised', 'Slow-cooked']
        }
    },
    
    balancedMealComponents: {
        vegetables: [{
            name: String,
            quantity: Number,
            unit: String,
            preparationMethod: String
        }],
        carbohydrates: [{
            name: String,
            quantity: Number,
            unit: String,
            type: {
                type: String,
                enum: ['Rice', 'Pasta', 'Bread', 'Potato', 'Quinoa', 'Other']
            }
        }],
        seasonings: [{
            name: String,
            quantity: Number,
            unit: String
        }]
    },
    
    recipeSummary: {
        title: String,
        description: String,
        prepTime: Number, // in minutes
        cookTime: Number, // in minutes
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium'
        },
        servings: {
            type: Number,
            default: 4
        }
    },
    
    detailedInstructions: {
        preparation: [String],
        cooking: [String],
        plating: [String],
        tips: [String]
    },
    
    nutritionPer100g: nutritionInfoSchema,
    nutritionPerServing: nutritionInfoSchema,
    
    helperInstructions: {
        simplified: String,
        stepByStep: [String],
        timingNotes: String,
        importantTips: [String]
    },
    
    cuisine: String,
    tags: [String],
    
    // Recommendation scoring
    healthScore: {
        type: Number,
        min: 1,
        max: 10,
        default: 7
    },
    
    popularityScore: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    
    // Seasonal availability
    bestSeasons: [{
        type: String,
        enum: ['Spring', 'Summer', 'Fall', 'Winter', 'Year-round']
    }],
    
    estimatedCost: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    }
}, {
    timestamps: true
});

// Index for efficient searching
meatRecommendationSchema.index({ meatType: 1, 'recipeSummary.difficulty': 1 });
meatRecommendationSchema.index({ healthScore: -1, popularityScore: -1 });

const MeatRecommendation = mongoose.model('MeatRecommendation', meatRecommendationSchema);
module.exports = MeatRecommendation;