import React, { useState } from 'react';
import axios from 'axios';

const HelperInstructions = ({ mealPlan }) => {
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [instructions, setInstructions] = useState(null);
    const [loading, setLoading] = useState(false);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const generateInstructions = async (day) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8000/api/meal-plans/${mealPlan._id}/helper-instructions/${day}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setInstructions(response.data);
        } catch (error) {
            console.error('Error generating instructions:', error);
            if (error.response?.status === 404) {
                setInstructions({
                    day,
                    instructions: `📋 **Meal Preparation Instructions for ${day}**\n\nDear Helper,\n\nNo meals are planned for ${day} yet.\n\nPlease check back after meals are added to the weekly plan.\n\nThank you! 🙏`,
                    mealsCount: 0,
                    estimatedTotalTime: 0
                });
            } else {
                alert('Failed to generate instructions');
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (instructions) {
            navigator.clipboard.writeText(instructions.instructions).then(() => {
                alert('Instructions copied to clipboard! You can now send them to your helper.');
            });
        }
    };

    const sendInstructions = () => {
        if (instructions) {
            // Create a mailto link with the instructions
            const subject = `Meal Preparation Instructions for ${instructions.day}`;
            const body = encodeURIComponent(instructions.instructions);
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
            window.open(mailtoLink);
        }
    };

    const downloadInstructions = () => {
        if (instructions) {
            const blob = new Blob([instructions.instructions], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meal-instructions-${instructions.day.toLowerCase()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    };

    const getMealsForDay = (day) => {
        if (!mealPlan || !mealPlan.dailyMeals) return [];
        const dayEntry = mealPlan.dailyMeals.find(d => d.day === day);
        return dayEntry ? dayEntry.meals : [];
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>📋 Helper Instructions Generator</h3>
                <div className="text-muted">
                    Week of {new Date(mealPlan.weekStartDate).toLocaleDateString()}
                </div>
            </div>

            {/* Day Selection */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <label className="form-label fw-bold">Select Day for Instructions:</label>
                    <div className="btn-group w-100" role="group">
                        {daysOfWeek.map(day => {
                            const meals = getMealsForDay(day);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={`btn btn-outline-primary position-relative ${selectedDay === day ? 'active' : ''}`}
                                    onClick={() => setSelectedDay(day)}
                                >
                                    {day}
                                    {meals.length > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                                            {meals.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                    <button 
                        className="btn btn-primary w-100"
                        onClick={() => generateInstructions(selectedDay)}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : '📝 Generate Instructions'}
                    </button>
                </div>
            </div>

            {/* Day Overview */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">📅 {selectedDay} Overview</h5>
                        </div>
                        <div className="card-body">
                            {getMealsForDay(selectedDay).length > 0 ? (
                                <div className="row">
                                    {getMealsForDay(selectedDay).map((meal, index) => (
                                        <div key={index} className="col-md-6 col-lg-3 mb-3">
                                            <div className="border rounded p-3 h-100">
                                                <div className="d-flex align-items-center mb-2">
                                                    <span className="badge bg-secondary me-2">{meal.mealType}</span>
                                                    <small className="text-muted">{meal.servings} servings</small>
                                                </div>
                                                <h6 className="mb-1">{meal.recipeId?.name || 'Unknown Recipe'}</h6>
                                                {meal.preparationNotes && (
                                                    <small className="text-muted">Note: {meal.preparationNotes}</small>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-3">
                                    <p className="mb-0">No meals planned for {selectedDay}</p>
                                    <small>Add meals to your weekly plan to generate instructions.</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Generated Instructions */}
            {instructions && (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">📋 Instructions for {instructions.day}</h5>
                        <div className="btn-group">
                            <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={copyToClipboard}
                                title="Copy to clipboard"
                            >
                                📋 Copy
                            </button>
                            <button 
                                className="btn btn-outline-success btn-sm"
                                onClick={sendInstructions}
                                title="Send via email"
                            >
                                📧 Email
                            </button>
                            <button 
                                className="btn btn-outline-info btn-sm"
                                onClick={downloadInstructions}
                                title="Download as file"
                            >
                                💾 Download
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        {/* Summary Stats */}
                        <div className="row mb-4 text-center">
                            <div className="col-4">
                                <div className="border rounded p-3">
                                    <h4 className="mb-1 text-primary">{instructions.mealsCount}</h4>
                                    <small className="text-muted">Meals</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="border rounded p-3">
                                    <h4 className="mb-1 text-warning">{formatTime(instructions.estimatedTotalTime)}</h4>
                                    <small className="text-muted">Total Time</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="border rounded p-3">
                                    <h4 className="mb-1 text-success">
                                        {instructions.estimatedTotalTime > 0 ? 
                                            formatTime(Math.max(30, instructions.estimatedTotalTime - 120)) : 
                                            '0m'
                                        }
                                    </h4>
                                    <small className="text-muted">Start Time Before</small>
                                </div>
                            </div>
                        </div>

                        {/* Instructions Text */}
                        <div className="border rounded p-4 bg-light">
                            <div style={{ whiteSpace: 'pre-line', fontFamily: 'monospace', fontSize: '14px' }}>
                                {instructions.instructions}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 d-flex gap-2 justify-content-center">
                            <button 
                                className="btn btn-primary"
                                onClick={copyToClipboard}
                            >
                                📋 Copy Instructions
                            </button>
                            <button 
                                className="btn btn-success"
                                onClick={sendInstructions}
                            >
                                📧 Send to Helper
                            </button>
                            <button 
                                className="btn btn-info"
                                onClick={downloadInstructions}
                            >
                                💾 Download File
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Helper Tips */}
            <div className="mt-5">
                <h5>💡 Tips for Working with Helpers</h5>
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">📝 Clear Communication</h6>
                                <ul className="card-text small mb-0">
                                    <li>Include timing for each step</li>
                                    <li>Specify serving sizes clearly</li>
                                    <li>Note any special dietary requirements</li>
                                    <li>Provide contact info for questions</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">🏠 Kitchen Setup</h6>
                                <ul className="card-text small mb-0">
                                    <li>Ensure all ingredients are available</li>
                                    <li>Check that cooking tools are clean</li>
                                    <li>Set up workspace before helper arrives</li>
                                    <li>Label containers and storage areas</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelperInstructions;