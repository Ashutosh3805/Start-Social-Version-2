import React, { useState, useMemo } from 'react';
import { manufacturers } from '../data/projects';
import { useProfiles } from '../hooks/useProfiles';
import FilterBar from './FilterBar';
import ProjectCard from './ProjectCard';

const FILTERS = [
    {
        label: 'Industry',
        key: 'industry',
        options: ['Metal', 'Packaging', 'Electronics', 'Textile', 'Chemicals', 'Wood'],
    },
    {
        label: 'MOQ',
        key: 'moq',
        options: ['MOQ: 10 kg', 'MOQ: 20 units', 'MOQ: 50 units', 'MOQ: 100 units', 'MOQ: 200 units', 'MOQ: 500 units'],
    },
    {
        label: 'Location',
        key: 'location',
        options: ['Stuttgart', 'Amsterdam', 'Shenzhen', 'Dhaka', 'Chicago', 'Portland'],
    },
];

const Manufacturers = () => {
    const [activeFilters, setActiveFilters] = useState({});
    const { profiles: realProfiles } = useProfiles('manufacturer');

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => setActiveFilters({});

    // Merge: real backend profiles first, then static mocks
    const allItems = useMemo(() => [...realProfiles, ...manufacturers], [realProfiles]);

    const filtered = useMemo(() => {
        return allItems.filter(item => {
            const indMatch = !activeFilters.industry || item.tags.includes(activeFilters.industry);
            const moqMatch = !activeFilters.moq || item.stage === activeFilters.moq;
            const locMatch = !activeFilters.location || item.location === activeFilters.location;
            return indMatch && moqMatch && locMatch;
        });
    }, [activeFilters, allItems]);

    return (
        <main className="main-content">
            <div className="section-header">
                <h2 className="section-title">Manufacturers</h2>
                <p className="section-subtitle">Connect with vetted production partners across the globe.</p>
            </div>
            <FilterBar
                filters={FILTERS}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                resultCount={filtered.length}
            />
            <div className="projects-grid">
                {filtered.length > 0
                    ? filtered.map(item => <ProjectCard key={item.id} project={item} />)
                    : <p className="no-results">No manufacturers match the selected filters.</p>
                }
            </div>
        </main>
    );
};

export default Manufacturers;
