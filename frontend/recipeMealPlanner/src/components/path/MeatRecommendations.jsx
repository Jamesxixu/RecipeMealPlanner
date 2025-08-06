import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MeatRecommendations = ({ selectedMeatType, currentMealPlan, onMealPlanUpdate }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [expandedRecipe, setExpandedRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedServings, setSelectedServings] = useState(4);
    const [helperInstructions, setHelperInstructions] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        fetchRecommendations();
    }, [selectedMeatType]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/meat-recommendations/by-meat/${selectedMeatType}?limit=6`);
            setRecommendations(response.data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateHelperInstructions = async (recommendationId) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8000/api/meat-recommendations/${recommendationId}/helper-instructions?servings=${selectedServings}`
            );
            setHelperInstructions(response.data);
            setShowInstructions(true);
        } catch (error) {
            console.error('Error generating helper instructions:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Instructions copied to clipboard!');
        });
    };

    const addToMealPlan = async (recommendationId, day, mealType) => {
        if (!currentMealPlan) {
            alert('Please create a meal plan first');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8000/api/meal-plans/${currentMealPlan._id}/meals`,
                {
                    day,
                    recipeId: recommendationId, // Using recommendation as recipe for now
                    mealType,
                    servings: selectedServings
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            onMealPlanUpdate(response.data);
            alert('Meal added to your plan!');
        } catch (error) {
            console.error('Error adding to meal plan:', error);
            alert('Failed to add meal to plan');
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'success';
            case 'Medium': return 'warning';
            case 'Hard': return 'danger';
            default: return 'secondary';
        }
    };

    const getHealthScoreColor = (score) => {
        if (score >= 8) return 'success';
        if (score >= 6) return 'warning';
        return 'danger';
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Balanced {selectedMeatType} Meals</h3>
                <div className="d-flex align-items-center gap-3">
                    <label className="form-label mb-0">Servings:</label>
                    <select 
                        className="form-select" 
                        style={{width: 'auto'}}
                        value={selectedServings}
                        onChange={(e) => setSelectedServings(parseInt(e.target.value))}
                    >
                        {[2, 3, 4, 5, 6, 8].map(num => (
                            <option key={num} value={num}>{num} people</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && !recommendations.length ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {recommendations.map((rec) => (
                        <div key={rec._id} className="col-lg-6 col-xl-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">{rec.recipeSummary.title}</h6>
                                    <div className="d-flex gap-2">
                                        <span className={`badge bg-${getDifficultyColor(rec.recipeSummary.difficulty)}`}>
                                            {rec.recipeSummary.difficulty}
                                        </span>
                                        <span className={`badge bg-${getHealthScoreColor(rec.healthScore)}`}>
                                            Health: {rec.healthScore}/10
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="card-body">
                                    <p className="card-text text-muted small">
                                        {rec.recipeSummary.description}
                                    </p>
                                    
                                    {/* Quick Info */}
                                    <div className="row text-center mb-3">
                                        <div className="col-4">
                                            <small className="text-muted">Prep</small>
                                            <div>{rec.recipeSummary.prepTime}min</div>
                                        </div>
                                        <div className="col-4">
                                            <small className="text-muted">Cook</small>
                                            <div>{rec.recipeSummary.cookTime}min</div>
                                        </div>
                                        <div className="col-4">
                                            <small className="text-muted">Calories</small>
                                            <div>{rec.nutritionPerServing?.calories || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {/* Meal Components Summary */}
                                    <div className="mb-3">
                                        <h6 className="small fw-bold">Balanced Components:</h6>
                                        <div className="row small">
                                            <div className="col-6">
                                                <strong>Protein:</strong> {rec.primaryProtein.name}
                                            </div>
                                            <div className="col-6">
                                                <strong>Method:</strong> {rec.primaryProtein.cookingMethod}
                                            </div>
                                        </div>
                                        {rec.balancedMealComponents.vegetables.length > 0 && (
                                            <div className="small mt-1">
                                                <strong>Vegetables:</strong> {rec.balancedMealComponents.vegetables.map(v => v.name).join(', ')}
                                            </div>
                                        )}
                                        {rec.balancedMealComponents.carbohydrates.length > 0 && (
                                            <div className="small">
                                                <strong>Carbs:</strong> {rec.balancedMealComponents.carbohydrates.map(c => c.name).join(', ')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-grid gap-2">
                                        <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => setExpandedRecipe(expandedRecipe === rec._id ? null : rec._id)}
                                        >
                                            {expandedRecipe === rec._id ? 'Hide Details' : 'View Full Recipe'}
                                        </button>
                                        
                                        <button 
                                            className="btn btn-success btn-sm"
                                            onClick={() => generateHelperInstructions(rec._id)}
                                            disabled={loading}
                                        >
                                            Generate Helper Instructions
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Recipe Details */}
                                {expandedRecipe === rec._id && (
                                    <div className="card-footer">
                                        <div className="small">
                                            <h6 className="fw-bold">Detailed Instructions:</h6>
                                            
                                            {/* Ingredients */}
                                            <div className="mb-3">
                                                <strong>Ingredients for {selectedServings} servings:</strong>
                                                <ul className="list-unstyled ms-3 mt-1">
                                                    <li>• {(150 * selectedServings / 4).toFixed(0)}g {rec.primaryProtein.name}</li>
                                                    {rec.balancedMealComponents.vegetables.map((veg, idx) => (
                                                        <li key={idx}>• {(veg.quantity * selectedServings / 4).toFixed(1)} {veg.unit} {veg.name}</li>
                                                    ))}
                                                    {rec.balancedMealComponents.carbohydrates.map((carb, idx) => (
                                                        <li key={idx}>• {(carb.quantity * selectedServings / 4).toFixed(1)} {carb.unit} {carb.name}</li>
                                                    ))}
                                                    {rec.balancedMealComponents.seasonings.map((seasoning, idx) => (
                                                        <li key={idx}>• {(seasoning.quantity * selectedServings / 4).toFixed(1)} {seasoning.unit} {seasoning.name}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Cooking Steps */}
                                            {rec.detailedInstructions.cooking.length > 0 && (
                                                <div className="mb-3">
                                                    <strong>Cooking Steps:</strong>
                                                    <ol className="ms-3 mt-1">
                                                        {rec.detailedInstructions.cooking.map((step, idx) => (
                                                            <li key={idx} className="mb-1">{step}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )}

                                            {/* Tips */}
                                            {rec.detailedInstructions.tips.length > 0 && (
                                                <div>
                                                    <strong>Pro Tips:</strong>
                                                    <ul className="list-unstyled ms-3 mt-1">
                                                        {rec.detailedInstructions.tips.map((tip, idx) => (
                                                            <li key={idx} className="mb-1">💡 {tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Helper Instructions Modal */}
            {showInstructions && helperInstructions && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Helper Instructions: {helperInstructions.recipeTitle}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setShowInstructions(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <small className="text-muted">
                                            For {helperInstructions.servings} servings • 
                                            Total time: {helperInstructions.totalTime} minutes
                                        </small>
                                    </div>
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => copyToClipboard(helperInstructions.instructions)}
                                    >
                                        📋 Copy Instructions
                                    </button>
                                </div>
                                
                                <div style={{whiteSpace: 'pre-line'}} className="border p-3 bg-light">
                                    {helperInstructions.instructions}
                                </div>

                                {helperInstructions.nutritionInfo && (
                                    <div className="mt-3">
                                        <h6>Nutrition Information (Total):</h6>
                                        <div className="row text-center">
                                            <div className="col-2">
                                                <small>Calories</small>
                                                <div>{helperInstructions.nutritionInfo.calories}</div>
                                            </div>
                                            <div className="col-2">
                                                <small>Protein</small>
                                                <div>{helperInstructions.nutritionInfo.protein}g</div>
                                            </div>
                                            <div className="col-2">
                                                <small>Carbs</small>
                                                <div>{helperInstructions.nutritionInfo.carbohydrates}g</div>
                                            </div>
                                            <div className="col-2">
                                                <small>Fat</small>
                                                <div>{helperInstructions.nutritionInfo.fat}g</div>
                                            </div>
                                            <div className="col-2">
                                                <small>Fiber</small>
                                                <div>{helperInstructions.nutritionInfo.fiber}g</div>
                                            </div>
                                            <div className="col-2">
                                                <small>Sodium</small>
                                                <div>{helperInstructions.nutritionInfo.sodium}mg</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowInstructions(false)}
                                >
                                    Close
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => copyToClipboard(helperInstructions.instructions)}
                                >
                                    Copy to Clipboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeatRecommendations;