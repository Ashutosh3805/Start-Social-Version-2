import React, { useState, useMemo } from 'react';
import { startups } from '../data/projects';
import { useProfiles } from '../hooks/useProfiles';
import FilterBar from './FilterBar';
import ProjectCard from './ProjectCard';

const FILTERS = [
    {
        label: 'Category',
        key: 'category',
        options: ['SaaS', 'CleanTech', 'HealthTech', 'EdTech', 'FinTech', 'AgriTech'],
    },
    {
        label: 'Stage',
        key: 'stage',
        options: ['Pre-Seed', 'Seed', 'Series A', 'Series B'],
    },
    {
        label: 'Location',
        key: 'location',
        options: ['San Francisco', 'Berlin', 'Boston', 'Bangalore', 'London', 'Nairobi'],
    },
];

const Startups = () => {
    const [activeFilters, setActiveFilters] = useState({});
    const { profiles: realProfiles } = useProfiles('startup');

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => setActiveFilters({});

    // Merge: real backend profiles first, then static mocks
    const allItems = useMemo(() => [...realProfiles, ...startups], [realProfiles]);

    const filtered = useMemo(() => {
        return allItems.filter(item => {
            const catMatch = !activeFilters.category || item.tags.includes(activeFilters.category);
            const stageMatch = !activeFilters.stage || item.stage === activeFilters.stage;
            const locMatch = !activeFilters.location || item.location === activeFilters.location;
            return catMatch && stageMatch && locMatch;
        });
    }, [activeFilters, allItems]);

    return (
        <main className="main-content">
            <div className="section-header">
                <h2 className="section-title">Startups</h2>
                <p className="section-subtitle">Discover and connect with the boldest new ventures.</p>
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
                    : <p className="no-results">No startups match the selected filters.</p>
                }
            </div>
        </main>
    );
};

export default Startups;
