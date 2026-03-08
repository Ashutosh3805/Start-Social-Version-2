import React, { useState, useMemo } from 'react';
import { freelancers } from '../data/projects';
import { useProfiles } from '../hooks/useProfiles';
import FilterBar from './FilterBar';
import ProjectCard from './ProjectCard';

const FILTERS = [
    {
        label: 'Skill',
        key: 'skill',
        options: ['Engineer', 'Designer', 'ML Engineer', 'Marketer', 'Blockchain Dev', 'Tech Writer'],
    },
    {
        label: 'Availability',
        key: 'availability',
        options: ['Available Now', 'Available Nov', 'Available Dec'],
    },
    {
        label: 'Location',
        key: 'location',
        options: ['Remote (UTC-5)', 'Remote (UTC+5:30)', 'Remote (UTC+8)', 'Remote (UTC+0)', 'Remote (UTC+1)', 'Remote (UTC-6)'],
    },
];

const Freelancers = () => {
    const [activeFilters, setActiveFilters] = useState({});
    const { profiles: realProfiles } = useProfiles('freelancer');

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => setActiveFilters({});

    // Merge: real backend profiles first, then static mocks
    const allItems = useMemo(() => [...realProfiles, ...freelancers], [realProfiles]);

    const filtered = useMemo(() => {
        return allItems.filter(item => {
            const skillMatch = !activeFilters.skill || item.tags.includes(activeFilters.skill);
            const availMatch = !activeFilters.availability || item.stage === activeFilters.availability;
            const locMatch = !activeFilters.location || item.location === activeFilters.location;
            return skillMatch && availMatch && locMatch;
        });
    }, [activeFilters, allItems]);

    return (
        <main className="main-content">
            <div className="section-header">
                <h2 className="section-title">Freelancers</h2>
                <p className="section-subtitle">Hire world-class independent talent for your next project.</p>
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
                    : <p className="no-results">No freelancers match the selected filters.</p>
                }
            </div>
        </main>
    );
};

export default Freelancers;
