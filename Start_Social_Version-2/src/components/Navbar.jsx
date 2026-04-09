import React, { useState, useRef, useEffect } from 'react';
import { Rocket, Search, LogOut, MessageSquare, ChevronDown, UserCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from './ChatSidebar';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [chatOpen, setChatOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-left">
                        <Link to="/" className="logo">
                            <div className="logo-icon-wrapper">
                                <Rocket size={20} className="logo-icon" fill="currentColor" />
                            </div>
                            <span className="logo-text">StartSocial</span>
                        </Link>
                    </div>

                    <div className="navbar-center">
                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search projects, tags, or founders..."
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="navbar-right">
                        {user ? (
                            <div className="navbar-profile-wrapper" ref={dropdownRef}>
                                <button
                                    className={`navbar-profile-btn ${dropdownOpen ? 'navbar-profile-btn--open' : ''}`}
                                    onClick={() => setDropdownOpen(o => !o)}
                                    aria-expanded={dropdownOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="navbar-avatar">
                                        {user.profile?.imageUrl
                                            ? <img src={`http://localhost:5001${user.profile.imageUrl}`} alt="avatar" className="navbar-avatar-img" />
                                            : <UserCircle2 size={22} />
                                        }
                                    </div>
                                    <span className="navbar-user-name">Hi, {user.name?.split(' ')[0]}</span>
                                    <ChevronDown size={15} className={`navbar-chevron ${dropdownOpen ? 'navbar-chevron--up' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="navbar-dropdown" role="menu">
                                        <Link
                                            to="/profile/edit"
                                            className="navbar-dropdown-item"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <UserCircle2 size={15} />
                                            Profile
                                        </Link>
                                        <div className="navbar-dropdown-divider" />
                                        <button
                                            className="navbar-dropdown-item navbar-dropdown-item--danger"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={15} />
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn-link">Log in</Link>
                                <Link to="/signup" className="btn-primary">Sign up</Link>
                            </>
                        )}

                        {/* Chat icon button */}
                        <button
                            className={`btn-chat-icon ${chatOpen ? 'btn-chat-icon--active' : ''}`}
                            onClick={() => setChatOpen(o => !o)}
                            title="Community Chat"
                        >
                            <MessageSquare size={20} />
                            <span className="chat-icon-pulse" />
                        </button>
                    </div>
                </div>
            </nav>

            <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </>
    );
};

export default Navbar;
