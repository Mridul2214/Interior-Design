import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    X,
    Send,
    Wand2,
    Bed,
    Search,
    Sofa,
    Building2,
    Sparkles
} from 'lucide-react';
import './css/AIChat.css';

const AIChat = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);

    // Hide on "field pages" (like Create/Edit forms)
    const isFieldPage = location.pathname.includes('/new') || location.pathname.includes('/edit');

    // Auto-hide welcome message after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowWelcome(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (isFieldPage) return null;

    return (
        <div className="ai-chat-container">
            {/* Welcome Tip */}
            {showWelcome && !isOpen && (
                <div className="ai-welcome-popup">
                    Hi! I'm your AI Agent. Feel free to ask anything! 👋
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-window">
                    <div className="ai-header">
                        <div className="ai-header-info">
                            <div className="ai-bot-icon">
                                <Wand2 size={20} />
                            </div>
                            <div className="ai-title-group">
                                <h3>Ryphira Intelligence</h3>
                                <p>Online • Instant Assistance</p>
                            </div>
                        </div>
                        <button className="btn-close-chat" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ai-messages">
                        <div className="message-wrapper">
                            <div className="msg-bot-avatar">
                                <Sparkles size={16} />
                            </div>
                            <div className="ai-message-bubble">
                                Hello! I'm your AI assistant for creating interior design quotations.
                                I'll help you create a professional quotation in just a few steps.
                                <br /><br />
                                Let's start! What type of interior design project are you quoting for?
                                <br /><br />
                                For example: **Bedroom renovation**, **Kitchen modular design**, or **Office interior**.
                                <span className="ai-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="ai-quick-start">
                        <span className="quick-start-label">Suggesting for you</span>
                        <div className="quick-options-grid">
                            <button className="btn-quick-opt">
                                <Bed size={16} color="#6366f1" />
                                <span>Bedroom</span>
                            </button>
                            <button className="btn-quick-opt">
                                <Search size={16} color="#a855f7" />
                                <span>Kitchen</span>
                            </button>
                            <button className="btn-quick-opt">
                                <Sofa size={16} color="#3b82f6" />
                                <span>Living Room</span>
                            </button>
                            <button className="btn-quick-opt">
                                <Building2 size={16} color="#64748b" />
                                <span>Corporate</span>
                            </button>
                        </div>
                    </div>

                    <div className="ai-input-area">
                        <div className="ai-input-wrapper">
                            <input type="text" placeholder="Describe your project here..." />
                        </div>
                        <button className="btn-ai-send">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button with Sparkles */}
            <button
                className={`ai-fab ${isOpen ? 'active' : ''}`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowWelcome(false);
                }}
            >
                {/* Visual Sparkles */}
                {!isOpen && (
                    <div className="sparkle-container">
                        <div className="sparkle s1"></div>
                        <div className="sparkle s2"></div>
                        <div className="sparkle s3"></div>
                        <div className="sparkle s4"></div>
                    </div>
                )}

                {isOpen ? <X size={28} /> : <Wand2 size={28} />}
                {!isOpen && <div className="fab-dot"></div>}
            </button>
        </div>
    );
};

export default AIChat;
