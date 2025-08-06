import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/authSlice';
import MeatRecommendations from './MeatRecommendations';
import WeeklyCalendar from './WeeklyCalendar';
import ShoppingListGenerator from './ShoppingListGenerator';
import HelperInstructions from './HelperInstructions';

const MealPlanner = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('planner');
    const [currentMealPlan, setCurrentMealPlan] = useState(null);
    const [mealPlans, setMealPlans] = useState([]);
    const [selectedMeatType, setSelectedMeatType] = useState('Chicken');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get current week dates
    const getCurrentWeekDates = () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return { startOfWeek, endOfWeek };
    };

    useEffect(() => {
        fetchMealPlans();
    }, []);

    const fetchMealPlans = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/meal-plans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMealPlans(response.data);
            
            // Set current week's plan if exists
            const { startOfWeek } = getCurrentWeekDates();
            const currentWeekPlan = response.data.find(plan => 
                new Date(plan.weekStartDate).toDateString() === startOfWeek.toDateString()
            );
            if (currentWeekPlan) {
                setCurrentMealPlan(currentWeekPlan);
            }
        } catch (error) {
            setError('Failed to fetch meal plans');
            console.error('Error fetching meal plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const createNewMealPlan = async () => {
        try {
            setLoading(true);
            const { startOfWeek, endOfWeek } = getCurrentWeekDates();
            const token = localStorage.getItem('token');
            
            const response = await axios.post('http://localhost:8000/api/meal-plans', {
                weekStartDate: startOfWeek.toISOString(),
                weekEndDate: endOfWeek.toISOString(),
                preferredMeatTypes: [selectedMeatType],
                shoppingDays: ['Tuesday', 'Saturday'],
                nutritionalGoals: {
                    caloriesPerDay: 2000,
                    proteinGoal: 150,
                    carbGoal: 250,
                    fatGoal: 70
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCurrentMealPlan(response.data);
            setMealPlans(prev => [response.data, ...prev]);
            setError('');
        } catch (error) {
            setError('Failed to create meal plan');
            console.error('Error creating meal plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const meatTypes = ['Chicken', 'Beef', 'Fish', 'Pork', 'Turkey', 'Lamb', 'Seafood'];

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3 col-lg-2 px-md-4 bg-light sidebar">
                    <div className="d-flex flex-column pt-3">
                        <h5 className="mb-3">🍽️ Meal Planner</h5>
                        
                        {/* Meat Type Selector */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Preferred Meat Type</label>
                            <select 
                                className="form-select"
                                value={selectedMeatType}
                                onChange={(e) => setSelectedMeatType(e.target.value)}
                            >
                                {meatTypes.map(meat => (
                                    <option key={meat} value={meat}>{meat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="nav nav-pills flex-column">
                            <button 
                                className={`nav-link ${activeTab === 'planner' ? 'active' : ''} text-start mb-2`}
                                onClick={() => setActiveTab('planner')}
                            >
                                📅 Weekly Planner
                            </button>
                            <button 
                                className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''} text-start mb-2`}
                                onClick={() => setActiveTab('recommendations')}
                            >
                                🥩 Meat Recommendations
                            </button>
                            <button 
                                className={`nav-link ${activeTab === 'shopping' ? 'active' : ''} text-start mb-2`}
                                onClick={() => setActiveTab('shopping')}
                            >
                                🛒 Shopping Lists
                            </button>
                            <button 
                                className={`nav-link ${activeTab === 'instructions' ? 'active' : ''} text-start mb-2`}
                                onClick={() => setActiveTab('instructions')}
                            >
                                📋 Helper Instructions
                            </button>
                        </nav>

                        {/* Create Meal Plan Button */}
                        {!currentMealPlan && (
                            <button 
                                className="btn btn-primary mt-4"
                                onClick={createNewMealPlan}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create This Week\'s Plan'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-9 col-lg-10 ms-sm-auto px-md-4">
                    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                        <h1 className="h2">
                            {activeTab === 'planner' && '📅 Weekly Meal Planner'}
                            {activeTab === 'recommendations' && '🥩 Meat-Based Recommendations'}
                            {activeTab === 'shopping' && '🛒 Shopping Lists'}
                            {activeTab === 'instructions' && '📋 Helper Instructions'}
                        </h1>
                        
                        {currentMealPlan && (
                            <div className="text-muted">
                                Week of {new Date(currentMealPlan.weekStartDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'planner' && (
                            <div className="tab-pane fade show active">
                                {currentMealPlan ? (
                                    <WeeklyCalendar 
                                        mealPlan={currentMealPlan}
                                        onMealPlanUpdate={setCurrentMealPlan}
                                        selectedMeatType={selectedMeatType}
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <h4>No meal plan for this week</h4>
                                        <p className="text-muted">Create a new meal plan to get started with your weekly planning.</p>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={createNewMealPlan}
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create This Week\'s Plan'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'recommendations' && (
                            <div className="tab-pane fade show active">
                                <MeatRecommendations 
                                    selectedMeatType={selectedMeatType}
                                    currentMealPlan={currentMealPlan}
                                    onMealPlanUpdate={setCurrentMealPlan}
                                />
                            </div>
                        )}

                        {activeTab === 'shopping' && (
                            <div className="tab-pane fade show active">
                                {currentMealPlan ? (
                                    <ShoppingListGenerator 
                                        mealPlan={currentMealPlan}
                                        onMealPlanUpdate={setCurrentMealPlan}
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <h4>Create a meal plan first</h4>
                                        <p className="text-muted">You need to create a meal plan before generating shopping lists.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'instructions' && (
                            <div className="tab-pane fade show active">
                                {currentMealPlan ? (
                                    <HelperInstructions 
                                        mealPlan={currentMealPlan}
                                    />
                                ) : (
                                    <div className="text-center py-5">
                                        <h4>Create a meal plan first</h4>
                                        <p className="text-muted">You need to create a meal plan before generating helper instructions.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;