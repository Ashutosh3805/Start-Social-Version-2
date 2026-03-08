import React, { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import './FilterBar.css';

/**
 * FilterBar
 * @param {Array}  filters       - [{ label: 'Category', key: 'categories', options: ['AI','SaaS',...] }]
 * @param {Object} activeFilters - { categories: 'AI', stage: 'Seed', ... }
 * @param {Function} onFilterChange - (key, value) => void
 * @param {Function} onReset      - () => void
 * @param {number}  resultCount
 */
const FilterBar = ({ filters = [], activeFilters = {}, onFilterChange, onReset, resultCount }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (key) => {
        setOpenDropdown(prev => (prev === key ? null : key));
    };

    const handleSelect = (key, value) => {
        onFilterChange(key, value);
        setOpenDropdown(null);
    };

    const hasActiveFilters = Object.values(activeFilters).some(Boolean);

    return (
        <div className="filter-bar">
            <div className="filter-controls">
                <div className="filter-header">
                    <Filter size={16} />
                    <span>Filters:</span>
                </div>

                {filters.map(({ label, key, options }) => (
                    <div key={key} className="filter-dropdown-wrapper">
                        <button
                            className={`filter-pill ${activeFilters[key] ? 'active-filter' : ''}`}
                            onClick={() => toggleDropdown(key)}
                        >
                            {activeFilters[key] ? activeFilters[key] : label}
                            <ChevronDown size={14} className={`chevron ${openDropdown === key ? 'chevron-open' : ''}`} />
                        </button>

                        {openDropdown === key && (
                            <div className="filter-dropdown">
                                {options.map((opt) => (
                                    <button
                                        key={opt}
                                        className={`dropdown-option ${activeFilters[key] === opt ? 'selected' : ''}`}
                                        onClick={() => handleSelect(key, activeFilters[key] === opt ? '' : opt)}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {hasActiveFilters && (
                    <button className="reset-link" onClick={onReset}>
                        <X size={12} /> Reset all
                    </button>
                )}
            </div>

            <div className="result-count">
                {resultCount} result{resultCount !== 1 ? 's' : ''} found
            </div>
        </div>
    );
};

export default FilterBar;
