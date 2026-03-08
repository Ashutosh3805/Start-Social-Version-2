import { useState, useEffect } from 'react';

const API = 'http://localhost:5001/api';

/**
 * Maps a raw DB user profile into a ProjectCard-compatible shape.
 */
function mapProfile(user) {
    const p = user.profile || {};
    const role = user.role;

    // Title
    const title =
        p.companyName || p.fullName || p.fundName || user.name || 'Unknown';

    // Description / bio
    const description = p.description || p.bio || '';

    // Tags (array-ified from comma-separated strings or single value)
    const rawTags =
        role === 'freelancer'
            ? p.skills
            : role === 'investor'
                ? p.focusAreas
                : p.industry || p.products || '';

    const tags = rawTags
        ? String(rawTags)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [];

    // Stage / availability / moq
    const stage =
        p.stage || p.availability || p.preferredStage || p.moq || '';

    // Image
    const image = p.imageUrl ? `${API.replace('/api', '')}${p.imageUrl}` : null;

    return {
        id: user.id,
        title,
        description,
        image,
        tags,
        categories: [],
        stage,
        location: p.location || '',
        founded: p.teamSize || p.hourlyRate || '',
        website: p.website || p.portfolioUrl || '',
        _isReal: true, // flag to distinguish from static mock data
    };
}

/**
 * useProfiles(role) — fetches all user profiles for a given role.
 * Returns { profiles: ProjectCard[], loading: boolean, error: string|null }
 */
export function useProfiles(role) {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetch(`${API}/profile/all?role=${role}`)
            .then(res => res.json())
            .then(data => {
                if (cancelled) return;
                if (Array.isArray(data)) {
                    setProfiles(data.map(mapProfile));
                } else {
                    setError(data.message || 'Failed to load profiles');
                }
            })
            .catch(() => {
                if (!cancelled) setError('Could not reach server');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [role]);

    return { profiles, loading, error };
}
