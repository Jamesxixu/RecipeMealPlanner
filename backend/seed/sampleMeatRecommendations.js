const MeatRecommendation = require('../models/meatRecommendationModel');

const sampleMeatRecommendations = [
    {
        meatType: 'Chicken',
        primaryProtein: {
            name: 'Chicken Breast',
            cut: 'boneless, skinless breast',
            cookingMethod: 'Grilled'
        },
        balancedMealComponents: {
            vegetables: [
                { name: 'Broccoli', quantity: 2, unit: 'Cups', preparationMethod: 'steamed' },
                { name: 'Bell Peppers', quantity: 1, unit: 'Cups', preparationMethod: 'grilled' }
            ],
            carbohydrates: [
                { name: 'Brown Rice', quantity: 1, unit: 'Cups', type: 'Rice' }
            ],
            seasonings: [
                { name: 'Garlic Powder', quantity: 1, unit: 'Tsp' },
                { name: 'Herbs de Provence', quantity: 1, unit: 'Tsp' },
                { name: 'Olive Oil', quantity: 2, unit: 'Tbsp' }
            ]
        },
        recipeSummary: {
            title: 'Mediterranean Grilled Chicken with Vegetables',
            description: 'A healthy, balanced meal featuring grilled chicken breast with colorful vegetables and brown rice.',
            prepTime: 20,
            cookTime: 25,
            difficulty: 'Easy',
            servings: 4
        },
        detailedInstructions: {
            preparation: [
                'Season chicken breasts with salt, pepper, garlic powder, and herbs',
                'Cut bell peppers into strips',
                'Wash and cut broccoli into florets',
                'Rinse brown rice until water runs clear'
            ],
            cooking: [
                'Start cooking brown rice according to package instructions',
                'Preheat grill to medium-high heat',
                'Grill chicken breasts for 6-7 minutes per side until internal temperature reaches 165°F',
                'Steam broccoli for 4-5 minutes until tender-crisp',
                'Grill bell peppers for 3-4 minutes until slightly charred',
                'Let chicken rest for 5 minutes before slicing'
            ],
            plating: [
                'Serve sliced chicken over brown rice',
                'Arrange steamed broccoli and grilled peppers alongside',
                'Drizzle with olive oil and fresh herbs if desired'
            ],
            tips: [
                'Pound chicken to even thickness for uniform cooking',
                'Use a meat thermometer to ensure proper doneness',
                'Let chicken rest to retain juices'
            ]
        },
        nutritionPer100g: {
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 3.6,
            fiber: 0,
            sodium: 74
        },
        nutritionPerServing: {
            calories: 380,
            protein: 35,
            carbohydrates: 45,
            fat: 8,
            fiber: 6,
            sodium: 320
        },
        helperInstructions: {
            simplified: 'Grill seasoned chicken, steam vegetables, cook rice, and serve together',
            stepByStep: [
                'Start rice first (45 minutes total)',
                'Season and grill chicken (15 minutes)',
                'Steam broccoli and grill peppers (8 minutes)',
                'Let everything rest and plate together'
            ],
            timingNotes: 'Start rice first, then prep other ingredients while it cooks',
            importantTips: [
                'Check chicken temperature with thermometer',
                'Keep vegetables crisp, not mushy',
                'Chicken should rest 5 minutes before serving'
            ]
        },
        cuisine: 'Mediterranean',
        tags: ['healthy', 'balanced', 'low-fat', 'high-protein'],
        healthScore: 9,
        popularityScore: 8,
        bestSeasons: ['Spring', 'Summer', 'Year-round'],
        estimatedCost: 'Medium'
    },
    {
        meatType: 'Beef',
        primaryProtein: {
            name: 'Beef Sirloin',
            cut: 'sirloin steak',
            cookingMethod: 'Pan-fried'
        },
        balancedMealComponents: {
            vegetables: [
                { name: 'Asparagus', quantity: 1.5, unit: 'Cups', preparationMethod: 'roasted' },
                { name: 'Mushrooms', quantity: 1, unit: 'Cups', preparationMethod: 'sautéed' }
            ],
            carbohydrates: [
                { name: 'Sweet Potato', quantity: 2, unit: 'Pcs', type: 'Potato' }
            ],
            seasonings: [
                { name: 'Rosemary', quantity: 1, unit: 'Tbsp' },
                { name: 'Thyme', quantity: 1, unit: 'Tsp' },
                { name: 'Butter', quantity: 2, unit: 'Tbsp' }
            ]
        },
        recipeSummary: {
            title: 'Pan-Seared Sirloin with Roasted Vegetables',
            description: 'Tender beef sirloin with roasted sweet potatoes and seasonal vegetables.',
            prepTime: 15,
            cookTime: 30,
            difficulty: 'Medium',
            servings: 4
        },
        detailedInstructions: {
            preparation: [
                'Bring steaks to room temperature 30 minutes before cooking',
                'Wash and pierce sweet potatoes',
                'Trim asparagus ends and slice mushrooms',
                'Season steaks with salt, pepper, and fresh herbs'
            ],
            cooking: [
                'Preheat oven to 425°F for sweet potatoes',
                'Roast sweet potatoes for 45-50 minutes',
                'Heat cast iron skillet over medium-high heat',
                'Sear steaks 3-4 minutes per side for medium-rare',
                'Roast asparagus for last 12 minutes of potato cooking',
                'Sauté mushrooms in the same pan as steaks'
            ],
            plating: [
                'Slice steaks against the grain',
                'Split sweet potatoes and fluff with fork',
                'Arrange vegetables alongside steak',
                'Top with herb butter'
            ],
            tips: [
                'Let steaks rest at room temperature before cooking',
                'Don\'t move steaks while searing for good crust',
                'Use thermometer for desired doneness'
            ]
        },
        nutritionPer100g: {
            calories: 250,
            protein: 26,
            carbohydrates: 0,
            fat: 15,
            fiber: 0,
            sodium: 54
        },
        nutritionPerServing: {
            calories: 450,
            protein: 32,
            carbohydrates: 35,
            fat: 18,
            fiber: 8,
            sodium: 280
        },
        helperInstructions: {
            simplified: 'Roast sweet potatoes, sear steaks, roast asparagus, sauté mushrooms',
            stepByStep: [
                'Start sweet potatoes in oven (50 minutes)',
                'Prep and season steaks (10 minutes)',
                'Add asparagus to oven (12 minutes)',
                'Sear steaks and sauté mushrooms (8 minutes)'
            ],
            timingNotes: 'Sweet potatoes take longest - start them first',
            importantTips: [
                'Steaks should be room temperature before cooking',
                'Don\'t flip steaks too early',
                'Let steaks rest 5 minutes after cooking'
            ]
        },
        cuisine: 'American',
        tags: ['hearty', 'protein-rich', 'comfort-food'],
        healthScore: 7,
        popularityScore: 9,
        bestSeasons: ['Fall', 'Winter', 'Year-round'],
        estimatedCost: 'High'
    },
    {
        meatType: 'Fish',
        primaryProtein: {
            name: 'Salmon Fillet',
            cut: 'skin-on fillet',
            cookingMethod: 'Baked'
        },
        balancedMealComponents: {
            vegetables: [
                { name: 'Green Beans', quantity: 1.5, unit: 'Cups', preparationMethod: 'steamed' },
                { name: 'Cherry Tomatoes', quantity: 1, unit: 'Cups', preparationMethod: 'roasted' }
            ],
            carbohydrates: [
                { name: 'Quinoa', quantity: 1, unit: 'Cups', type: 'Quinoa' }
            ],
            seasonings: [
                { name: 'Lemon', quantity: 1, unit: 'Pcs' },
                { name: 'Dill', quantity: 2, unit: 'Tbsp' },
                { name: 'Olive Oil', quantity: 3, unit: 'Tbsp' }
            ]
        },
        recipeSummary: {
            title: 'Herb-Baked Salmon with Quinoa',
            description: 'Omega-3 rich salmon with fresh herbs, served with quinoa and seasonal vegetables.',
            prepTime: 15,
            cookTime: 20,
            difficulty: 'Easy',
            servings: 4
        },
        detailedInstructions: {
            preparation: [
                'Rinse quinoa until water runs clear',
                'Pat salmon fillets dry and season with salt and pepper',
                'Wash green beans and cherry tomatoes',
                'Chop fresh dill and slice lemon'
            ],
            cooking: [
                'Preheat oven to 400°F',
                'Cook quinoa according to package instructions',
                'Arrange salmon on baking sheet with tomatoes',
                'Drizzle with olive oil and top with dill',
                'Bake for 12-15 minutes until fish flakes easily',
                'Steam green beans for 5-6 minutes until tender'
            ],
            plating: [
                'Fluff quinoa with fork',
                'Place salmon over quinoa bed',
                'Arrange green beans and roasted tomatoes around',
                'Garnish with lemon wedges and fresh dill'
            ],
            tips: [
                'Don\'t overcook salmon - it should flake easily',
                'Remove skin after cooking for easier serving',
                'Add lemon juice just before serving'
            ]
        },
        nutritionPer100g: {
            calories: 208,
            protein: 22,
            carbohydrates: 0,
            fat: 12,
            fiber: 0,
            sodium: 59
        },
        nutritionPerServing: {
            calories: 420,
            protein: 30,
            carbohydrates: 38,
            fat: 16,
            fiber: 5,
            sodium: 290
        },
        helperInstructions: {
            simplified: 'Cook quinoa, bake seasoned salmon with tomatoes, steam green beans',
            stepByStep: [
                'Start quinoa first (15 minutes)',
                'Prep salmon and vegetables (5 minutes)',
                'Bake salmon and tomatoes (15 minutes)',
                'Steam green beans (6 minutes)'
            ],
            timingNotes: 'Start quinoa first, then prep everything else while it cooks',
            importantTips: [
                'Salmon is done when it flakes easily with fork',
                'Don\'t overcook - salmon continues cooking after removed from oven',
                'Keep green beans bright green and crisp'
            ]
        },
        cuisine: 'Mediterranean',
        tags: ['healthy', 'omega-3', 'light', 'nutritious'],
        healthScore: 10,
        popularityScore: 7,
        bestSeasons: ['Spring', 'Summer', 'Year-round'],
        estimatedCost: 'Medium'
    }
];

const seedMeatRecommendations = async () => {
    try {
        // Clear existing recommendations
        await MeatRecommendation.deleteMany({});
        
        // Insert sample data
        await MeatRecommendation.insertMany(sampleMeatRecommendations);
        
        console.log('✅ Sample meat recommendations seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding meat recommendations:', error);
    }
};

module.exports = { sampleMeatRecommendations, seedMeatRecommendations };