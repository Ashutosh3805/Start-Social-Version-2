import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { ArrowLeft, Send, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ChatSidebar.css';

const SOCKET_URL = 'http://localhost:5001';

// Format timestamp
const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ── ChatSidebar ───────────────────────────────────────────────────────────────
const ChatSidebar = ({ isOpen, onClose }) => {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [onlineCount, setOnlineCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && user) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, user]);

    // Socket connection
    useEffect(() => {
        if (!isOpen) return;

        const socket = io(SOCKET_URL, {
            auth: {
                token: token || null,
                name: user?.name || 'Guest',
            },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socket.on('chat:history', (history) => {
            setMessages(history);
        });

        socket.on('chat:message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('chat:online', (count) => {
            setOnlineCount(count);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [isOpen, token, user?.name]);

    const sendMessage = () => {
        const text = inputText.trim();
        if (!text || !socketRef.current || !user) return;
        socketRef.current.emit('chat:message', text);
        setInputText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`chat-backdrop ${isOpen ? 'chat-backdrop--visible' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar panel */}
            <aside className={`chat-sidebar ${isOpen ? 'chat-sidebar--open' : ''}`}>
                {/* ── Header ── */}
                <div className="chat-header">
                    <button className="chat-back-btn" onClick={onClose} title="Close chat">
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>

                    <div className="chat-header-center">
                        <MessageSquare size={18} className="chat-header-icon" />
                        <h2 className="chat-title">Community Chat</h2>
                    </div>

                    <div className="chat-online-badge">
                        <span className={`chat-dot ${connected ? 'chat-dot--green' : 'chat-dot--gray'}`} />
                        <Users size={14} />
                        <span>{onlineCount}</span>
                    </div>
                </div>

                {/* ── Messages ── */}
                <div className="chat-messages">
                    {messages.length === 0 && (
                        <div className="chat-empty">
                            <MessageSquare size={40} className="chat-empty-icon" />
                            <p>No messages yet.</p>
                            <p className="chat-empty-sub">Be the first to say hello! 👋</p>
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isOwn = user && msg.senderId === user.id;
                        return (
                            <div
                                key={msg.id}
                                className={`chat-message-row ${isOwn ? 'chat-message-row--own' : ''}`}
                            >
                                {!isOwn && (
                                    <div className="chat-avatar">
                                        {msg.senderName?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className={`chat-bubble ${isOwn ? 'chat-bubble--own' : 'chat-bubble--other'}`}>
                                    {!isOwn && (
                                        <span className="chat-sender-name">{msg.senderName}</span>
                                    )}
                                    <p className="chat-bubble-text">{msg.text}</p>
                                    <span className="chat-bubble-time">{formatTime(msg.timestamp)}</span>
                                </div>
                                {isOwn && (
                                    <div className="chat-avatar chat-avatar--own">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input ── */}
                <div className="chat-input-area">
                    {user ? (
                        <>
                            <input
                                ref={inputRef}
                                className="chat-input"
                                type="text"
                                placeholder="Type a message…"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                maxLength={500}
                                disabled={!connected}
                            />
                            <button
                                className="chat-send-btn"
                                onClick={sendMessage}
                                disabled={!inputText.trim() || !connected}
                                title="Send message"
                            >
                                <Send size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="chat-guest-prompt">
                            <span>
                                <a href="/login" className="chat-login-link">Log in</a> to send messages
                            </span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default ChatSidebar;
