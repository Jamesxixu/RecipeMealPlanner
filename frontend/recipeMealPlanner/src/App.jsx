import React from 'react'

import { Route, Routes } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import {AuthProvider} from './auth/authSlice';
import Home from './components/path/Home';
import Savedrecipes from './components/path/Savedrecipes'
import ShoppingList from './components/path/ShoppingList';
import Kitchen from './components/path/Kitchen';
import RecipeDetail from './components/path/RecipeDetail';
import Profile from './components/path/Profile';
import MealPlanner from './components/path/MealPlanner';



import './App.css'
function App() {
  return (
    <>
      <div className='homePage'>
      
      <AuthProvider>
        <Routes>
          <Route path='/Dashboard' element={<Dashboard />}/>
          <Route path='/' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/Dashboard/recipes' element={<Home />}/>
          <Route path='/Dashboard/myrecipes' element={<Savedrecipes />}/>
          <Route path='/Dashboard/shoppinglist' element = {<ShoppingList/>}/>
          <Route path='/Dashboard/mykitchen' element={<Kitchen/>}/>
          <Route path='/Dashboard/recipes/:recipeId' element={<RecipeDetail/>}/>
          <Route path='/Dashboard/meal-planner' element={<MealPlanner/>}/>
          <Route path='/profile' element={<Profile />}/>
        </Routes>
      </AuthProvider>
      </div>
    </>
  )
}

export default App