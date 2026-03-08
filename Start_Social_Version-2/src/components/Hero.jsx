import React from 'react';
import './Hero.css';

const Hero = ({ activeTab, onTabChange }) => {
    const tabs = ['STARTUPS', 'FREELANCERS', 'INVESTORS', 'MANUFACTURERS'];

    return (
        <section className="hero">
            <div className="hero-content">
                <h1 className="hero-title">
                    Discover <span className="highlight">Innovation</span>
                </h1>
                <p className="hero-subtitle">
                    Explore the next generation of startups and creators.
                </p>

                <div className="hero-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => onTabChange(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
