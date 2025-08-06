import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShoppingListGenerator = ({ mealPlan, onMealPlanUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [shoppingLists, setShoppingLists] = useState({
        firstShop: [],
        secondShop: []
    });
    const [activeList, setActiveList] = useState('firstShop');

    useEffect(() => {
        if (mealPlan) {
            setShoppingLists({
                firstShop: mealPlan.firstShoppingList || [],
                secondShop: mealPlan.secondShoppingList || []
            });
        }
    }, [mealPlan]);

    const generateShoppingLists = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8000/api/meal-plans/${mealPlan._id}/shopping-lists`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            onMealPlanUpdate(response.data);
            setShoppingLists({
                firstShop: response.data.firstShoppingList || [],
                secondShop: response.data.secondShoppingList || []
            });
        } catch (error) {
            console.error('Error generating shopping lists:', error);
            alert('Failed to generate shopping lists');
        } finally {
            setLoading(false);
        }
    };

    const exportShoppingList = (listType) => {
        const list = listType === 'firstShop' ? shoppingLists.firstShop : shoppingLists.secondShop;
        const listName = listType === 'firstShop' ? 'First Shopping Trip' : 'Second Shopping Trip';
        const shoppingDay = listType === 'firstShop' ? 
            mealPlan.shoppingDays[0] : 
            mealPlan.shoppingDays[1];

        let exportText = `🛒 ${listName} - ${shoppingDay}\n`;
        exportText += `Generated on ${new Date().toLocaleDateString()}\n\n`;

        // Group by category
        const itemsByCategory = {};
        list.forEach(item => {
            if (!itemsByCategory[item.category]) {
                itemsByCategory[item.category] = [];
            }
            itemsByCategory[item.category].push(item);
        });

        // Sort categories by priority
        const categoryOrder = ['Chicken', 'Beef', 'Fish', 'Seafood', 'Dairy', 'Vegetables', 'Fruits', 'Grain', 'Pantry', 'Beverages', 'Snacks', 'Frozen'];
        
        Object.keys(itemsByCategory).sort((a, b) => {
            const aIndex = categoryOrder.indexOf(a);
            const bIndex = categoryOrder.indexOf(b);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        }).forEach(category => {
            exportText += `${getCategoryEmoji(category)} ${category.toUpperCase()}\n`;
            itemsByCategory[category].forEach(item => {
                exportText += `  ☐ ${item.quantity} ${item.unit} ${item.name}`;
                if (item.priority === 'High') exportText += ' (Priority)';
                exportText += '\n';
            });
            exportText += '\n';
        });

        exportText += `\nTotal items: ${list.length}\n`;
        exportText += `Shopping day: ${shoppingDay}\n`;
        exportText += `\nTip: Check items off as you shop! 📝`;

        // Copy to clipboard
        navigator.clipboard.writeText(exportText).then(() => {
            alert('Shopping list copied to clipboard!');
        });
    };

    const getCategoryEmoji = (category) => {
        const emojis = {
            'Chicken': '🐔',
            'Beef': '🥩',
            'Fish': '🐟',
            'Seafood': '🦐',
            'Dairy': '🥛',
            'Vegetables': '🥬',
            'Fruits': '🍎',
            'Grain': '🌾',
            'Pantry': '🏪',
            'Beverages': '🥤',
            'Snacks': '🍿',
            'Frozen': '🧊',
            'Spices': '🌶️',
            'Herbs': '🌿',
            'Oils': '🫒',
            'Condiments': '🍯'
        };
        return emojis[category] || '📦';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'secondary';
        }
    };

    const renderShoppingList = (listType) => {
        const list = listType === 'firstShop' ? shoppingLists.firstShop : shoppingLists.secondShop;
        const listName = listType === 'firstShop' ? 'First Shopping Trip' : 'Second Shopping Trip';
        const shoppingDay = listType === 'firstShop' ? 
            (mealPlan.shoppingDays && mealPlan.shoppingDays[0]) || 'Tuesday' : 
            (mealPlan.shoppingDays && mealPlan.shoppingDays[1]) || 'Saturday';

        if (!list || list.length === 0) {
            return (
                <div className="text-center py-4 text-muted">
                    <p>No items in this shopping list yet.</p>
                    <small>Generate shopping lists from your meal plan to see items here.</small>
                </div>
            );
        }

        // Group by category
        const itemsByCategory = {};
        list.forEach(item => {
            if (!itemsByCategory[item.category]) {
                itemsByCategory[item.category] = [];
            }
            itemsByCategory[item.category].push(item);
        });

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                        {getCategoryEmoji('Shopping')} {listName}
                        <small className="text-muted ms-2">({shoppingDay})</small>
                    </h5>
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => exportShoppingList(listType)}
                    >
                        📋 Copy List
                    </button>
                </div>

                {Object.keys(itemsByCategory).map(category => (
                    <div key={category} className="mb-4">
                        <h6 className="text-uppercase small fw-bold text-muted mb-2">
                            {getCategoryEmoji(category)} {category}
                        </h6>
                        <div className="list-group list-group-flush">
                            {itemsByCategory[category].map((item, index) => (
                                <div key={index} className="list-group-item d-flex justify-content-between align-items-center py-2 px-0">
                                    <div className="d-flex align-items-center">
                                        <input 
                                            type="checkbox" 
                                            className="form-check-input me-3"
                                            id={`${listType}-${category}-${index}`}
                                        />
                                        <label 
                                            htmlFor={`${listType}-${category}-${index}`}
                                            className="form-check-label mb-0"
                                        >
                                            <strong>{item.quantity} {item.unit}</strong> {item.name}
                                        </label>
                                    </div>
                                    {item.priority && item.priority !== 'Medium' && (
                                        <span className={`badge bg-${getPriorityColor(item.priority)} small`}>
                                            {item.priority}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mt-4 p-3 bg-light rounded">
                    <div className="row text-center">
                        <div className="col-4">
                            <strong>{list.length}</strong>
                            <div className="small text-muted">Total Items</div>
                        </div>
                        <div className="col-4">
                            <strong>{shoppingDay}</strong>
                            <div className="small text-muted">Shopping Day</div>
                        </div>
                        <div className="col-4">
                            <strong>{list.filter(item => item.priority === 'High').length}</strong>
                            <div className="small text-muted">Priority Items</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Twice-Weekly Shopping Lists</h3>
                <button 
                    className="btn btn-primary"
                    onClick={generateShoppingLists}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : '🔄 Regenerate Lists'}
                </button>
            </div>

            {/* Shopping Strategy Info */}
            <div className="alert alert-info mb-4">
                <h6 className="alert-heading">📋 Smart Shopping Strategy</h6>
                <p className="mb-2">
                    Your shopping lists are optimized for twice-weekly trips to keep ingredients fresh:
                </p>
                <ul className="mb-0 small">
                    <li><strong>First trip:</strong> Non-perishables, pantry items, and half of fresh produce</li>
                    <li><strong>Second trip:</strong> Fresh proteins, remaining produce, and dairy items</li>
                    <li><strong>Priority items:</strong> Essential ingredients marked for attention</li>
                </ul>
            </div>

            {/* Shopping List Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeList === 'firstShop' ? 'active' : ''}`}
                        onClick={() => setActiveList('firstShop')}
                    >
                        🛒 First Shopping Trip
                        {shoppingLists.firstShop.length > 0 && (
                            <span className="badge bg-primary ms-2">{shoppingLists.firstShop.length}</span>
                        )}
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeList === 'secondShop' ? 'active' : ''}`}
                        onClick={() => setActiveList('secondShop')}
                    >
                        🛒 Second Shopping Trip
                        {shoppingLists.secondShop.length > 0 && (
                            <span className="badge bg-primary ms-2">{shoppingLists.secondShop.length}</span>
                        )}
                    </button>
                </li>
            </ul>

            {/* Shopping List Content */}
            <div className="tab-content">
                <div className="tab-pane fade show active">
                    {renderShoppingList(activeList)}
                </div>
            </div>

            {/* Shopping Tips */}
            <div className="mt-5">
                <h5>💡 Shopping Tips</h5>
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">🧊 Storage Tips</h6>
                                <ul className="card-text small mb-0">
                                    <li>Store proteins in coldest part of fridge</li>
                                    <li>Keep herbs fresh in water</li>
                                    <li>Separate fruits and vegetables</li>
                                    <li>Use produce within 3-5 days</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">💰 Money-Saving Tips</h6>
                                <ul className="card-text small mb-0">
                                    <li>Check store flyers before shopping</li>
                                    <li>Buy proteins in bulk and freeze</li>
                                    <li>Use seasonal vegetables when possible</li>
                                    <li>Compare unit prices, not package prices</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingListGenerator;