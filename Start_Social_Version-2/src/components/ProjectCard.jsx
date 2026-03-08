import React from 'react';
import { Bookmark, ArrowUpRight, MapPin, Calendar, Layers } from 'lucide-react';
import './ProjectCard.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80';

const ProjectCard = ({ project }) => {
    const imgSrc = project.image || FALLBACK_IMAGE;

    return (
        <div className="project-card">
            <div className="card-image-wrapper">
                <img
                    src={imgSrc}
                    alt={project.title}
                    className="card-image"
                    onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }}
                />
                <div className="card-overlay">
                    <div className="tags-container">
                        {(project.tags || []).map((tag, index) => (
                            <span key={index} className="tag-pill">{tag}</span>
                        ))}
                    </div>
                    <button className="bookmark-btn">
                        <Bookmark size={16} />
                    </button>
                </div>
            </div>

            <div className="card-content">
                <h3 className="card-title">{project.title}</h3>
                <p className="card-description">{project.description}</p>

                <div className="card-meta-row">
                    {(project.tags || []).map((tag, index) => (
                        <span key={index} className="meta-tag">{tag}</span>
                    ))}
                    {project.categories && project.categories.map((cat, idx) => (
                        <span key={idx} className="category-pill-sm">{cat}</span>
                    ))}
                </div>

                <div className="card-details-grid">
                    {project.stage && (
                        <div className="detail-item">
                            <div className="detail-dot"></div>
                            <span>{project.stage}</span>
                        </div>
                    )}
                    {project.founded && (
                        <div className="detail-item">
                            <Calendar size={14} className="detail-icon" />
                            <span>Founded {project.founded}</span>
                        </div>
                    )}
                    {project.location && (
                        <div className="detail-item location-item">
                            <MapPin size={14} className="detail-icon" />
                            <span>{project.location}</span>
                        </div>
                    )}
                </div>

                <button className="view-details-btn">
                    View Details
                    <ArrowUpRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
