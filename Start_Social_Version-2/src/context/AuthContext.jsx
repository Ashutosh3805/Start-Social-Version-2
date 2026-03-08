import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('ss_token'));
    const [loading, setLoading] = useState(true);

    // On mount, verify stored token with the server
    useEffect(() => {
        const bootstrap = async () => {
            if (!token) { setLoading(false); return; }
            try {
                const res = await fetch(`${API}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    // Token invalid — clear it
                    localStorage.removeItem('ss_token');
                    setToken(null);
                }
            } catch {
                // Server unreachable — keep local token but no user
            } finally {
                setLoading(false);
            }
        };
        bootstrap();
    }, []);

    const login = (newToken, userData) => {
        localStorage.setItem('ss_token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('ss_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export { API };
