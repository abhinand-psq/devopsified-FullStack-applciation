import React from 'react';
import './FiltersBar.css';

const FiltersBar = ({ categories, selectedCategory, onSelectCategory, showAvailableOnly, onToggleAvailable, priceRange, onPriceChange }) => {
    return (
        <div className="filters-bar">
            <div className="filter-group categories">
                <button
                    className={`category-chip ${selectedCategory === 'All' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('All')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => onSelectCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="filter-group options">
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={showAvailableOnly}
                        onChange={(e) => onToggleAvailable(e.target.checked)}
                    />
                    <span className="slider round"></span>
                    <span className="toggle-label">Available Now</span>
                </label>

                {/* Visual placeholder for price slider */}
                <div className="price-filter">
                    <span className="price-label">Price</span>
                    <div className="price-inputs">
                        <input
                            type="number"
                            placeholder="Min"
                            className="price-input"
                            value={priceRange.min}
                            onChange={(e) => onPriceChange({ ...priceRange, min: e.target.value })}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            className="price-input"
                            value={priceRange.max}
                            onChange={(e) => onPriceChange({ ...priceRange, max: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FiltersBar;
