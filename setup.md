# 🍽️ Enhanced Meal Planning App - Setup Guide

## Overview

This enhanced Recipe Meal Planner now includes comprehensive meal planning features specifically designed to help with giving instructions to your helper for daily meal preparation. The app includes:

### ✨ New Features Added:

1. **🥩 Meat-Based Meal Recommendations**
   - Balanced meal suggestions starting with common meat types
   - Expandable recipe cards with detailed instructions
   - Nutritional information and health scores

2. **🛒 Twice-Weekly Shopping Lists**
   - Smart categorization for optimal shopping trips
   - Tuesday and Saturday shopping schedule (customizable)
   - Priority item marking and perishable item management

3. **📋 Helper Instructions Generator**
   - Copy-paste ready instructions for your helper
   - Day-by-day meal preparation guidance
   - Timing notes and important tips included

4. **📅 Weekly Meal Planner**
   - Visual calendar for meal organization
   - Integration with shopping lists and recommendations
   - Nutritional goal tracking

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the `/backend` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/recipemealplanner
JWT_SECRET=your_jwt_secret_here
```

### 2. Database Setup & Seeding

```bash
# Start MongoDB (if using local installation)
mongod

# Seed the database with sample meat recommendations
cd backend
node seed/seedDatabase.js
```

### 3. Start the Backend

```bash
cd backend
npm start
```

The backend will run on `http://localhost:8000`

### 4. Start the Frontend

```bash
cd frontend/recipeMealPlanner
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📱 How to Use the New Features

### 1. **Creating a Weekly Meal Plan**

1. Login to your account
2. Navigate to "🍽️ Meal Planner" in the sidebar
3. Select your preferred meat type (Chicken, Beef, Fish, etc.)
4. Click "Create This Week's Plan"

### 2. **Getting Meat-Based Recommendations**

1. Go to the "🥩 Meat Recommendations" tab
2. Browse balanced meal suggestions for your selected meat type
3. Click "View Full Recipe" to see detailed ingredients and instructions
4. Click "Generate Helper Instructions" to create copy-paste instructions

### 3. **Managing Shopping Lists**

1. Go to the "🛒 Shopping Lists" tab
2. Click "🔄 Regenerate Lists" to create optimized twice-weekly lists
3. Use "📋 Copy List" to get formatted shopping lists
4. Items are automatically categorized by store sections

### 4. **Creating Helper Instructions**

1. Go to the "📋 Helper Instructions" tab
2. Select the day you want instructions for
3. Click "📝 Generate Instructions"
4. Use "📋 Copy Instructions" to get formatted text for your helper
5. Options to email or download the instructions

## 🎯 Key Workflow

### Daily Meal Planning Process:

1. **Weekly Setup** (Sunday)
   - Create new weekly meal plan
   - Select preferred meat types
   - Set nutritional goals

2. **Recipe Selection** (Sunday-Monday)
   - Browse meat recommendations
   - Add meals to calendar
   - Generate shopping lists

3. **Shopping Preparation** (Tuesday & Saturday)
   - Copy optimized shopping lists
   - Check priority items
   - Follow store section organization

4. **Daily Helper Instructions** (As needed)
   - Generate daily instructions
   - Copy/send to helper
   - Include timing and special notes

## 🛠️ Technical Features

### API Endpoints Added:

- `POST /api/meal-plans` - Create weekly meal plan
- `GET /api/meal-plans` - Get user's meal plans
- `POST /api/meal-plans/:id/meals` - Add meal to specific day
- `POST /api/meal-plans/:id/shopping-lists` - Generate shopping lists
- `POST /api/meal-plans/:id/helper-instructions/:day` - Generate helper instructions
- `GET /api/meat-recommendations/by-meat/:meatType` - Get recommendations by meat type
- `GET /api/meat-recommendations/:id/helper-instructions` - Generate helper instructions for recipe

### Database Models Added:

- **WeeklyMealPlan** - Stores weekly meal plans with shopping days and nutritional goals
- **MeatRecommendation** - Stores balanced meal recommendations with detailed instructions

## 🎉 Sample Usage

### Example Helper Instructions Output:

```
📋 **Meal Preparation Instructions for Monday**

Dear Helper,

Here are today's meal preparation instructions:

## Dinner

### 1. Mediterranean Grilled Chicken with Vegetables (4 servings)

**Ingredients needed:**
- 150.0 Pcs Chicken Breast
- 2.0 Cups Broccoli
- 1.0 Cups Bell Peppers
- 1.0 Cups Brown Rice

**Preparation Steps:**
1. Season chicken breasts with salt, pepper, garlic powder, and herbs
2. Start cooking brown rice according to package instructions
3. Preheat grill to medium-high heat
4. Grill chicken breasts for 6-7 minutes per side until internal temperature reaches 165°F

⏰ **Estimated prep time:** 20 minutes
⏰ **Estimated cook time:** 25 minutes

## General Guidelines

- Please start preparations 2 hours before meal time
- Wash all vegetables and fruits before use
- Keep cooked food warm until serving
- Clean as you go to maintain a tidy kitchen
- Call me if you have any questions

Thank you for your help! 🙏
```

### Example Shopping List Output:

```
🛒 First Shopping Trip - Tuesday
Generated on 1/15/2024

🌾 GRAIN
  ☐ 1.0 Cups Brown Rice

🏪 PANTRY
  ☐ 1.0 Tsp Garlic Powder
  ☐ 1.0 Tsp Herbs de Provence

🫒 OILS
  ☐ 2.0 Tbsp Olive Oil

Total items: 3
Shopping day: Tuesday

Tip: Check items off as you shop! 📝
```

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection**: Ensure MongoDB is running and connection string is correct
2. **Missing Dependencies**: Run `npm install` in both backend and frontend directories
3. **Port Conflicts**: Check that ports 8000 and 5173 are available
4. **Authentication**: Clear localStorage and re-login if experiencing auth issues

### Sample Data:

The app includes pre-seeded meat recommendations for:
- Chicken (Mediterranean Grilled Chicken)
- Beef (Pan-Seared Sirloin)
- Fish (Herb-Baked Salmon)

## 📞 Support

The application is designed to be intuitive and user-friendly. All helper instructions are formatted for easy copy-paste sharing via text, email, or messaging apps.

Enjoy your enhanced meal planning experience! 🍽️✨