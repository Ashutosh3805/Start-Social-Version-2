import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, TrendingUp, Wrench, Users, ArrowLeft, Upload, X } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './OnboardingPage.css';

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLES = [
    {
        id: 'startup',
        label: 'Startup',
        icon: Rocket,
        color: '#8B5CF6',
        bg: 'rgba(139,92,246,0.12)',
        desc: 'Building something new and bold',
    },
    {
        id: 'investor',
        label: 'Investor',
        icon: TrendingUp,
        color: '#10B981',
        bg: 'rgba(16,185,129,0.12)',
        desc: 'Funding the next big thing',
    },
    {
        id: 'freelancer',
        label: 'Freelancer',
        icon: Users,
        color: '#3B82F6',
        bg: 'rgba(59,130,246,0.12)',
        desc: 'Independent talent for hire',
    },
    {
        id: 'manufacturer',
        label: 'Manufacturer',
        icon: Wrench,
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
        desc: 'Making products at scale',
    },
];

// ── Role-specific form fields ─────────────────────────────────────────────────
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
        { name: 'focusAreas', label: 'Focus Areas', type: 'text', placeholder: 'SaaS, HealthTech, CleanTech…' },
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

// ── Field renderer ────────────────────────────────────────────────────────────
const Field = ({ field, value, onChange }) => {
    const { name, label, type, placeholder, options } = field;

    if (type === 'textarea') {
        return (
            <div className="ob-field-group">
                <label htmlFor={name}>{label}</label>
                <textarea id={name} name={name} placeholder={placeholder} value={value}
                    onChange={onChange} rows={3} />
            </div>
        );
    }
    if (type === 'select') {
        return (
            <div className="ob-field-group">
                <label htmlFor={name}>{label}</label>
                <select id={name} name={name} value={value} onChange={onChange}>
                    <option value="">Select…</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        );
    }
    return (
        <div className="ob-field-group">
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );
};

// ── Image Upload Field ────────────────────────────────────────────────────────
const ImageUploadField = ({ imageFile, onImageChange, roleColor }) => {
    const preview = imageFile ? URL.createObjectURL(imageFile) : null;

    return (
        <div className="ob-field-group ob-image-upload-group" style={{ '--role-color': roleColor }}>
            <label>Profile Image / Logo</label>
            <div className="ob-image-upload-area">
                {preview ? (
                    <div className="ob-image-preview-wrapper">
                        <img src={preview} alt="Preview" className="ob-image-preview" />
                        <button
                            type="button"
                            className="ob-image-remove-btn"
                            onClick={() => onImageChange(null)}
                            title="Remove image"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <label htmlFor="profile-image" className="ob-image-dropzone">
                        <Upload size={24} />
                        <span>Click to upload</span>
                        <span className="ob-image-hint">PNG, JPG, WebP · Max 5 MB</span>
                    </label>
                )}
                <input
                    id="profile-image"
                    name="image"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => onImageChange(e.target.files[0] || null)}
                />
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const OnboardingPage = () => {
    const { token, setUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState('pick');   // 'pick' | 'form'
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRolePick = (role) => {
        setSelectedRole(role);
        // Pre-fill empty form state for every field in this role
        const empty = {};
        FORM_FIELDS[role.id].forEach(f => (empty[f.name] = ''));
        setFormData(empty);
        setImageFile(null);
        setStep('form');
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Use FormData for multipart so we can upload the image
            const fd = new FormData();
            fd.append('role', selectedRole.id);
            // Append each profile field individually
            Object.entries(formData).forEach(([key, val]) => {
                fd.append(key, val);
            });
            if (imageFile) {
                fd.append('image', imageFile);
            }

            const res = await fetch(`${API}/profile`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // NOTE: Do NOT set Content-Type — browser sets it with boundary
                },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setUser(data.user);
            navigate('/', { replace: true });
        } catch {
            setError('Could not reach server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const roleObj = selectedRole ? ROLES.find(r => r.id === selectedRole.id) : null;

    return (
        <div className="ob-page">
            <Navbar />
            <div className="ob-content-area">
                {/* ── Step 1: Role picker ── */}
                {step === 'pick' && (
                    <div className="ob-container ob-fade-in">
                        <div className="ob-header">
                            <h1 className="ob-title">I am a…</h1>
                            <p className="ob-subtitle">Choose your role to personalise your experience</p>
                        </div>

                        <div className="ob-role-grid">
                            {ROLES.map((role) => {
                                const Icon = role.icon;
                                return (
                                    <button
                                        key={role.id}
                                        className="ob-role-card"
                                        style={{ '--role-color': role.color, '--role-bg': role.bg }}
                                        onClick={() => handleRolePick(role)}
                                    >
                                        <div className="ob-role-icon">
                                            <Icon size={28} />
                                        </div>
                                        <h3 className="ob-role-label">{role.label}</h3>
                                        <p className="ob-role-desc">{role.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Step 2: Role form ── */}
                {step === 'form' && roleObj && (
                    <div className="ob-container ob-fade-in">
                        <button className="ob-back-btn" onClick={() => setStep('pick')}>
                            <ArrowLeft size={16} /> Back
                        </button>

                        <div className="ob-form-header">
                            <div className="ob-role-badge" style={{ background: roleObj.bg, color: roleObj.color }}>
                                {React.createElement(roleObj.icon, { size: 18 })}
                                <span>{roleObj.label}</span>
                            </div>
                            <h1 className="ob-title">Set up your profile</h1>
                            <p className="ob-subtitle">Tell the community who you are</p>
                        </div>

                        <form onSubmit={handleSubmit} className="ob-form">
                            <div className="ob-fields-grid">
                                {/* Image upload at the top */}
                                <ImageUploadField
                                    imageFile={imageFile}
                                    onImageChange={setImageFile}
                                    roleColor={roleObj.color}
                                />

                                {FORM_FIELDS[selectedRole.id].map(field => (
                                    <Field
                                        key={field.name}
                                        field={field}
                                        value={formData[field.name] || ''}
                                        onChange={handleFieldChange}
                                    />
                                ))}
                            </div>

                            {error && <p className="auth-error">{error}</p>}

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Saving…' : 'Complete setup →'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingPage;
