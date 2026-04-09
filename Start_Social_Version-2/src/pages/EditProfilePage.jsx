import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './EditProfilePage.css';

// ── Role-specific field definitions (same as Onboarding) ──────────────────────
const FORM_FIELDS = {
    startup: [
        { name: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g. TechFlow Inc.' },
        { name: 'tagline', label: 'Tagline', type: 'text', placeholder: 'One sentence about your startup' },
        { name: 'industry', label: 'Industry', type: 'select', options: ['SaaS', 'HealthTech', 'FinTech', 'CleanTech', 'EdTech', 'AgriTech', 'Other'] },
        { name: 'stage', label: 'Stage', type: 'select', options: ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'] },
        { name: 'teamSize', label: 'Team Size', type: 'select', options: ['1 (Solo)', '2–5', '6–10', '11–50', '51+'] },
        { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
        { name: 'website', label: 'Website (optional)', type: 'url', placeholder: 'https://yoursite.com' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What problem do you solve?' },
    ],
    investor: [
        { name: 'fundName', label: 'Fund / Firm Name', type: 'text', placeholder: 'e.g. Apex Ventures' },
        { name: 'focusAreas', label: 'Focus Areas', type: 'text', placeholder: 'SaaS, HealthTech…' },
        { name: 'preferredStage', label: 'Preferred Stage', type: 'select', options: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Any'] },
        { name: 'ticketSize', label: 'Ticket Size', type: 'select', options: ['< $50K', '$50K–$500K', '$500K–$2M', '$2M–$10M', '$10M+'] },
        { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
        { name: 'portfolioUrl', label: 'Portfolio / Website', type: 'url', placeholder: 'https://' },
        { name: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell founders about your investment thesis' },
    ],
    freelancer: [
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Your professional name' },
        { name: 'title', label: 'Title / Role', type: 'text', placeholder: 'e.g. Full-Stack Engineer' },
        { name: 'skills', label: 'Top Skills', type: 'text', placeholder: 'React, Node.js, Python…' },
        { name: 'hourlyRate', label: 'Hourly Rate (USD)', type: 'select', options: ['< $25', '$25–$50', '$50–$100', '$100–$200', '$200+'] },
        { name: 'availability', label: 'Availability', type: 'select', options: ['Available Now', 'Available in 2 weeks', 'Available next month', 'Not available'] },
        { name: 'location', label: 'Timezone / Location', type: 'text', placeholder: 'Remote (UTC+5:30)' },
        { name: 'portfolioUrl', label: 'Portfolio / GitHub', type: 'url', placeholder: 'https://' },
        { name: 'bio', label: 'Bio', type: 'textarea', placeholder: 'What makes you great to work with?' },
    ],
    manufacturer: [
        { name: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g. PrecisionCraft Industries' },
        { name: 'industry', label: 'Industry', type: 'select', options: ['Electronics', 'Metal', 'Textile', 'Packaging', 'Chemicals', 'Wood', 'Food', 'Other'] },
        { name: 'products', label: 'Products / Services', type: 'text', placeholder: 'CNC machining, PCB assembly…' },
        { name: 'moq', label: 'Minimum Order Qty', type: 'text', placeholder: 'e.g. 100 units or 10 kg' },
        { name: 'certifications', label: 'Certifications', type: 'text', placeholder: 'ISO 9001, REACH, RoHS…' },
        { name: 'location', label: 'Factory Location', type: 'text', placeholder: 'City, Country' },
        { name: 'website', label: 'Website (optional)', type: 'url', placeholder: 'https://' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What can you produce and for whom?' },
    ],
};

// ── Field component ───────────────────────────────────────────────────────────
const Field = ({ field, value, onChange }) => {
    const { name, label, type, placeholder, options } = field;
    if (type === 'textarea') {
        return (
            <div className="ep-field-group">
                <label htmlFor={name}>{label}</label>
                <textarea id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} rows={3} />
            </div>
        );
    }
    if (type === 'select') {
        return (
            <div className="ep-field-group">
                <label htmlFor={name}>{label}</label>
                <select id={name} name={name} value={value} onChange={onChange}>
                    <option value="">Select…</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        );
    }
    return (
        <div className="ep-field-group">
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const EditProfilePage = () => {
    const { user, token, setUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const role = user?.role;
    const fields = FORM_FIELDS[role] || [];

    // Fetch current profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setFormData(data.profile || {});
                    setExistingImage(data.profile?.imageUrl || null);
                }
            } catch {
                setError('Could not load profile data.');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('role', role);
            Object.entries(formData).forEach(([key, val]) => fd.append(key, val));
            if (imageFile) fd.append('image', imageFile);

            const res = await fetch(`${API}/profile`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setUser(data.user);
            setSuccess('Profile updated successfully!');
            setTimeout(() => navigate('/'), 1200);
        } catch {
            setError('Could not reach server.');
        } finally {
            setLoading(false);
        }
    };

    const imagePreview = imageFile
        ? URL.createObjectURL(imageFile)
        : existingImage
            ? `http://localhost:5001${existingImage}`
            : null;

    if (fetchLoading) {
        return (
            <div className="ep-page">
                <Navbar />
                <div className="ep-loading">Loading profile…</div>
            </div>
        );
    }

    return (
        <div className="ep-page">
            <Navbar />
            <div className="ep-content-area">
                <div className="ep-container">
                    {/* Header */}
                    <div className="ep-header">
                        <button className="ep-back-btn" onClick={() => navigate(-1)}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div>
                            <h1 className="ep-title">Edit Profile</h1>
                            <p className="ep-subtitle">Update your details — changes go live immediately</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="ep-form">
                        {/* Image Upload */}
                        <div className="ep-image-section">
                            <label className="ep-section-label">Profile Image / Logo</label>
                            <div className="ep-image-row">
                                <div className="ep-avatar-preview">
                                    {imagePreview
                                        ? <img src={imagePreview} alt="Preview" className="ep-avatar-img" />
                                        : <span className="ep-avatar-placeholder">{user?.name?.[0]?.toUpperCase() ?? '?'}</span>
                                    }
                                </div>
                                <div className="ep-image-actions">
                                    <label htmlFor="ep-image-input" className="ep-upload-btn">
                                        <Upload size={15} /> Upload new image
                                    </label>
                                    {(imageFile || existingImage) && (
                                        <button type="button" className="ep-remove-btn"
                                            onClick={() => { setImageFile(null); setExistingImage(null); }}>
                                            <X size={14} /> Remove
                                        </button>
                                    )}
                                    <input
                                        id="ep-image-input"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={e => setImageFile(e.target.files[0] || null)}
                                    />
                                    <p className="ep-image-hint">PNG, JPG, WebP · Max 5 MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Role badge */}
                        <div className="ep-role-badge">
                            {role && <span className={`ep-role-tag ep-role-tag--${role}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>}
                        </div>

                        {/* Fields grid */}
                        <div className="ep-fields-grid">
                            {fields.map(field => (
                                <Field
                                    key={field.name}
                                    field={field}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>

                        {error && <p className="ep-error">{error}</p>}
                        {success && <p className="ep-success">{success}</p>}

                        <div className="ep-actions">
                            <button type="button" className="ep-cancel-btn" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button type="submit" className="ep-save-btn" disabled={loading}>
                                <Save size={16} />
                                {loading ? 'Saving…' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
