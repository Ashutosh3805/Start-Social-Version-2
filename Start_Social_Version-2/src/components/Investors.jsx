import React, { useState, useMemo } from 'react';
import { investors } from '../data/projects';
import { useProfiles } from '../hooks/useProfiles';
import FilterBar from './FilterBar';
import ProjectCard from './ProjectCard';

const FILTERS = [
    {
        label: 'Focus Area',
        key: 'category',
        options: ['Deep Tech', 'Climate', 'SaaS', 'B2B', 'CleanTech', 'HealthTech', 'Consumer', 'FinTech', 'EdTech', 'Biotech', 'Quantum'],
    },
    {
        label: 'Stage',
        key: 'stage',
        options: ['Pre-Seed', 'Pre-Seed / Seed', 'Seed / Series A', 'Series A / B', 'Series C+'],
    },
    {
        label: 'Location',
        key: 'location',
        options: ['Singapore', 'New York', 'Amsterdam', 'Austin', 'London', 'Cambridge'],
    },
];

const Investors = () => {
    const [activeFilters, setActiveFilters] = useState({});
    const { profiles: realProfiles } = useProfiles('investor');

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => setActiveFilters({});

    // Merge: real backend profiles first, then static mocks
    const allItems = useMemo(() => [...realProfiles, ...investors], [realProfiles]);

    const filtered = useMemo(() => {
        return allItems.filter(item => {
            const catMatch = !activeFilters.category ||
                (item.categories && item.categories.includes(activeFilters.category)) ||
                item.tags.includes(activeFilters.category);
            const stageMatch = !activeFilters.stage || item.stage === activeFilters.stage;
            const locMatch = !activeFilters.location || item.location === activeFilters.location;
            return catMatch && stageMatch && locMatch;
        });
    }, [activeFilters, allItems]);

    return (
        <main className="main-content">
            <div className="section-header">
                <h2 className="section-title">Investors</h2>
                <p className="section-subtitle">Find the right capital partners for your growth stage.</p>
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
                    : <p className="no-results">No investors match the selected filters.</p>
                }
            </div>
        </main>
    );
};

export default Investors;
