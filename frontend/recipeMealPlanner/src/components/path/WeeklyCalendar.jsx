import React, { useState } from 'react';
import axios from 'axios';

const WeeklyCalendar = ({ mealPlan, onMealPlanUpdate, selectedMeatType }) => {
    const [loading, setLoading] = useState(false);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    const getMealsForDay = (day) => {
        if (!mealPlan || !mealPlan.dailyMeals) return [];
        const dayEntry = mealPlan.dailyMeals.find(d => d.day === day);
        return dayEntry ? dayEntry.meals : [];
    };

    const getMealsByType = (day, mealType) => {
        const dayMeals = getMealsForDay(day);
        return dayMeals.filter(meal => meal.mealType === mealType);
    };

    const addQuickMeal = async (day, mealType) => {
        // This would typically open a modal to select from recipes
        // For demo purposes, we'll add a placeholder
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // For now, create a simple meal entry
            const response = await axios.post(
                `http://localhost:8000/api/meal-plans/${mealPlan._id}/meals`,
                {
                    day,
                    recipeId: null, // Would be selected from recommendations
                    mealType,
                    servings: 4,
                    preparationNotes: `${selectedMeatType}-based meal`
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            onMealPlanUpdate(response.data);
        } catch (error) {
            console.error('Error adding meal:', error);
            alert('Failed to add meal. Please use the recommendations tab to add specific meals.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString, dayName) => {
        const date = new Date(dateString);
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = dayOfWeek.indexOf(dayName);
        
        // Calculate the actual date for this day of the week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + (currentDay || 7));
        
        return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isToday = (dayName) => {
        const today = new Date();
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayOfWeek[today.getDay()] === dayName;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>📅 Weekly Meal Calendar</h3>
                <div className="text-muted">
                    {new Date(mealPlan.weekStartDate).toLocaleDateString()} - {new Date(mealPlan.weekEndDate).toLocaleDateString()}
                </div>
            </div>

            {/* Shopping Days Indicator */}
            <div className="alert alert-info mb-4">
                <div className="d-flex align-items-center">
                    <span className="me-2">🛒</span>
                    <span>
                        <strong>Shopping Days:</strong> {mealPlan.shoppingDays?.join(' & ') || 'Tuesday & Saturday'}
                    </span>
                </div>
            </div>

            {/* Weekly Calendar Grid */}
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th style={{width: '120px'}}>Meal Type</th>
                            {daysOfWeek.map(day => (
                                <th key={day} className={`text-center ${isToday(day) ? 'bg-light' : ''}`}>
                                    <div className="fw-bold">{day}</div>
                                    <small className="text-muted">
                                        {formatDate(mealPlan.weekStartDate, day)}
                                    </small>
                                    {mealPlan.shoppingDays?.includes(day) && (
                                        <div><small className="badge bg-success">🛒 Shopping</small></div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mealTypes.map(mealType => (
                            <tr key={mealType}>
                                <td className="fw-bold bg-light align-middle">
                                    {mealType}
                                </td>
                                {daysOfWeek.map(day => (
                                    <td key={`${day}-${mealType}`} className={`${isToday(day) ? 'bg-light' : ''}`} style={{minHeight: '120px', verticalAlign: 'top'}}>
                                        <div className="position-relative h-100">
                                            {getMealsByType(day, mealType).map((meal, index) => (
                                                <div key={index} className="card mb-2 p-2 small">
                                                    <div className="fw-bold">
                                                        {meal.recipeId?.name || 'Planned Meal'}
                                                    </div>
                                                    <small className="text-muted">
                                                        {meal.servings} servings
                                                    </small>
                                                    {meal.preparationNotes && (
                                                        <small className="text-muted">
                                                            📝 {meal.preparationNotes}
                                                        </small>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {/* Add Meal Button */}
                                            <button 
                                                className="btn btn-outline-secondary btn-sm w-100 mt-1"
                                                onClick={() => addQuickMeal(day, mealType)}
                                                disabled={loading}
                                                style={{fontSize: '12px'}}
                                            >
                                                + Add Meal
                                            </button>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Instructions */}
            <div className="mt-4">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">📝 How to Use</h6>
                                <ul className="card-text small mb-0">
                                    <li>Go to "Meat Recommendations" to find balanced meals</li>
                                    <li>Click "Add Meal" buttons to add planned meals</li>
                                    <li>Use "Shopping Lists" to generate grocery lists</li>
                                    <li>Generate daily instructions for your helper</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">🎯 Weekly Goals</h6>
                                <div className="small">
                                    <div>Calories/day: {mealPlan.nutritionalGoals?.caloriesPerDay || 2000}</div>
                                    <div>Protein: {mealPlan.nutritionalGoals?.proteinGoal || 150}g</div>
                                    <div>Carbs: {mealPlan.nutritionalGoals?.carbGoal || 250}g</div>
                                    <div>Fat: {mealPlan.nutritionalGoals?.fatGoal || 70}g</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;