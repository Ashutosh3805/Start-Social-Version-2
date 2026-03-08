import React, { useState } from 'react';
import { Rocket, Search, LogOut, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from './ChatSidebar';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [chatOpen, setChatOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

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
                            <>
                                <span className="navbar-user-name">Hi, {user.name?.split(' ')[0]}</span>
                                <button className="btn-logout" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    Log out
                                </button>
                            </>
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
