import React, { useState, useMemo } from 'react';
import ServiceCard from './ServiceCard';
import FiltersBar from './FiltersBar';
import './ServiceList.css';

const ServiceList = ({ services, onServiceClick, onCreateService }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('newest');

    console.log(services)
    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(services.map(s => s.category));
        return Array.from(cats);
    }, [services]);

    // Filter and sort services
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            if (selectedCategory !== 'All' && service.category !== selectedCategory) return false;
            if (showAvailableOnly && !service.available) return false;
            if (priceRange.min && service.priceMin < Number(priceRange.min)) return false;
            if (priceRange.max && service.priceMax > Number(priceRange.max)) return false;
            return true;
        }).sort((a, b) => {
            if (sortBy === 'priceLow') return a.priceMin - b.priceMin;
            if (sortBy === 'priceHigh') return b.priceMin - a.priceMin;
            if (sortBy === 'views') return (b.stats?.views || 0) - (a.stats?.views || 0);
            // Default newest
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [services, selectedCategory, showAvailableOnly, priceRange, sortBy]);

    return (
        <div className="service-list-container">
            <div className="service-list-header">
                <div className="header-top">
                    <h2>Services <span className="service-count">({filteredServices.length})</span></h2>
                    <button className="create-service-btn" onClick={onCreateService}>
                        + Create Service
                    </button>
                </div>

                <FiltersBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    showAvailableOnly={showAvailableOnly}
                    onToggleAvailable={setShowAvailableOnly}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                />

                <div className="sort-row">
                    <span className="sort-label">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">Newest</option>
                        <option value="priceLow">Price: Low to High</option>
                        <option value="priceHigh">Price: High to Low</option>
                        <option value="views">Most Viewed</option>
                    </select>
                </div>
            </div>

            {filteredServices.length > 0 ? (
                <div className="services-grid">
                    {filteredServices.map(service => (
                        <ServiceCard
                            key={service._id}

                            service={service}
                            onClick={() => onServiceClick(service)}
                            onCall={() => console.log('Call', service._id)}
                            onSave={() => console.log('Save', service._id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <img src="https://via.placeholder.com/150?text=No+Services" alt="Empty" className="empty-illustration" />
                    <h3>No services found</h3>
                    <p>Try adjusting your filters or create a new service.</p>
                    <button className="btn-primary" onClick={onCreateService}>Create Service</button>
                </div>
            )}
        </div>
    );
};

export default ServiceList;
