require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app =express()
const PORT = process.env.PORT || 8000
const connectToDb = require('./config/connectToDB');
const userRoute = require('./routes/userRoute');
const shoppingListRoute = require('./routes/shoppingList');
const savedRecipeRoute =require('./routes/savedRecipeRoute')
const recipeRoute = require('./routes/recipeRoute')
const myKitchenRoute = require('./routes/myKitchenRoute')
const weeklyMealPlanRoute = require('./routes/weeklyMealPlanRoute')
const meatRecommendationRoute = require('./routes/meatRecommendationRoute')

connectToDb()

app.use(express.json())
app.use(cors({
    origin:true,
    credentials: true
}))

app.use('/users',userRoute);
app.use('/shoppingList',shoppingListRoute);
app.use('/savedRecipe',savedRecipeRoute)
app.use('/recipes',recipeRoute)
app.use('/myKitchen',myKitchenRoute)
app.use('/api/meal-plans',weeklyMealPlanRoute)
app.use('/api/meat-recommendations',meatRecommendationRoute)

app.listen(PORT,()=>{
    console.log(`Your Server Started on http://localhost:${PORT}`);
})
