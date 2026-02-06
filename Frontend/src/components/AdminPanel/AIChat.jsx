import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
    X,
    Send,
    Wand2,
    Bed,
    Search,
    Sofa,
    Building2,
    Sparkles,
    Loader2,
    History,
    Zap
} from 'lucide-react';
import { aiAPI } from '../../config/api';
import './css/AIChat.css';

const AIChat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: "Hello! I'm **Antigravity AI**, your creative partner. I can help you draft quotations, manage inventory, or analyze your business. \n\nWhat are we building today?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-hide welcome message
    useEffect(() => {
        const timer = setTimeout(() => setShowWelcome(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    const handleSend = async (text = input) => {
        const query = text || input;
        if (!query.trim() || isLoading) return;

        const userMsg = {
            role: 'user',
            content: query,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await aiAPI.query(query, location.pathname, {});

            if (response.success) {
                let botText = response.data;
                let actionData = null;

                // Improved Parsing: Extract JSON even if it's mixed with text
                const jsonPattern = /\{[\s\S]*"action"[\s\S]*\}/;
                const jsonMatch = botText.match(jsonPattern);

                if (jsonMatch) {
                    try {
                        actionData = JSON.parse(jsonMatch[0]);
                        // Clean the text to show only the message part
                        botText = botText.replace(jsonMatch[0], '').trim();
                        if (botText === '') botText = "I've prepared that for you! Check the form.";
                    } catch (e) {
                        // If it's pure JSON, the match might fail or the parse might fail
                        try {
                            actionData = JSON.parse(botText);
                            botText = "I've handled that for you! ✨";
                        } catch (innerE) {
                            console.error('Action parsing error:', innerE);
                        }
                    }
                }

                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: botText,
                    actionData: actionData, // Re-added this crucial line
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);

                // Handle Actions
                if (actionData) {
                    handleAIAction(actionData);
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "I'm having trouble connecting to my creative brain right now. Please try again in a moment.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAIAction = (actionObj) => {
        const { action, path, data, formType } = actionObj;

        if (action === 'NAVIGATE' && path) {
            navigate(path);
        } else if (action === 'SHOW_FORM' && formType) {
            // The form is handled by the message rendering logic below
            // using msg.actionData
        } else if (action === 'SUBMIT_FORM' && formType && data) {
            // Persist data for cross-page navigation reliability
            sessionStorage.setItem('AI_PENDING_DATA', JSON.stringify({ type: formType, data }));

            // Actual submission logic based on formType
            if (formType === 'QUOTATION') {
                window.dispatchEvent(new CustomEvent('AI_POPULATE_QUOTATION', { detail: data }));
                if (location.pathname !== '/quotations/new') navigate('/quotations/new');
            } else if (formType === 'CLIENT') {
                window.dispatchEvent(new CustomEvent('AI_POPULATE_CLIENT', { detail: data }));
                if (location.pathname !== '/clients') navigate('/clients');
            } else if (formType === 'INVENTORY') {
                window.dispatchEvent(new CustomEvent('AI_POPULATE_INVENTORY', { detail: data }));
                if (location.pathname !== '/inventory') navigate('/inventory');
            } else if (formType === 'TASK') {
                window.dispatchEvent(new CustomEvent('AI_POPULATE_TASK', { detail: data }));
                if (location.pathname !== '/tasks') navigate('/tasks');
            }
        }
    };

    const MiniForm = ({ type, initialData, onConfirm }) => {
        const [formData, setFormData] = useState(initialData || {});

        const fields = {
            QUOTATION: [
                { name: 'projectName', label: 'Project Name', type: 'text' },
                { name: 'clientName', label: 'Client Name', type: 'text' },
                { name: 'itemsCount', label: 'Number of Items', type: 'number' }
            ],
            CLIENT: [
                { name: 'name', label: 'Client Name', type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Phone', type: 'text' },
                { name: 'address', label: 'Site Address', type: 'text' }
            ],
            INVENTORY: [
                { name: 'itemName', label: 'Item Name', type: 'text' },
                { name: 'section', label: 'Section', type: 'select', options: ['Plywood', 'Hardware', 'Laminate', 'Veneer'] },
                { name: 'price', label: 'Price', type: 'number' },
                { name: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g. sheets, pcs' }
            ],
            TASK: [
                { name: 'title', label: 'Task Title', type: 'text' },
                { name: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
                { name: 'dueDate', label: 'Due Date', type: 'date' }
            ]
        };

        const currentFields = fields[type] || [];

        return (
            <div className="ai-mini-form">
                <div className="form-header">
                    <h4>GENERATE {type}</h4>
                </div>
                <div className="form-fields">
                    {currentFields.map(f => (
                        <div key={f.name} className="mini-field-group">
                            <label>{f.label}</label>
                            {f.type === 'select' ? (
                                <select
                                    className="mini-input"
                                    value={formData[f.name] || ''}
                                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                                >
                                    {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input
                                    className="mini-input"
                                    type={f.type}
                                    placeholder={f.placeholder || ''}
                                    value={formData[f.name] || ''}
                                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                                />
                            )}
                        </div>
                    ))}

                    {/* Special handling for Quotation items preview */}
                    {type === 'QUOTATION' && formData.items && (
                        <div className="mini-items-preview">
                            <label>Draft Items List:</label>
                            <div className="mini-items-scroll">
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="mini-item-row">
                                        <span className="item-dot">•</span>
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-qty">{item.qty} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button className="btn-confirm-form" onClick={() => onConfirm(formData)}>
                    Confirm & Complete <Zap size={14} />
                </button>
            </div>
        );
    };

    return (
        <div className="ai-chat-container">
            {showWelcome && !isOpen && (
                <div className="ai-welcome-popup">
                    Need a hand? I can write quotations for you! ✨
                </div>
            )}

            {isOpen && (
                <div className="ai-window">
                    <div className="ai-header">
                        <div className="ai-header-info">
                            <div className="ai-bot-icon">
                                <Zap size={20} />
                            </div>
                            <div className="ai-title-group">
                                <h3>Antigravity Intel</h3>
                                <p>Powered by Gemini 1.5</p>
                            </div>
                        </div>
                        <button className="btn-close-chat" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ai-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-wrapper ${msg.role}`}>
                                {msg.role === 'bot' && (
                                    <div className="msg-bot-avatar">
                                        <Sparkles size={16} />
                                    </div>
                                )}
                                <div className={`ai-message-bubble ${msg.role}`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>

                                    {/* Render Mini Form if action contains a form request */}
                                    {msg.actionData && msg.actionData.action === 'SHOW_FORM' && (
                                        <MiniForm
                                            type={msg.actionData.formType}
                                            initialData={msg.actionData.data}
                                            onConfirm={(updatedData) => handleAIAction({
                                                action: 'SUBMIT_FORM',
                                                formType: msg.actionData.formType,
                                                data: updatedData
                                            })}
                                        />
                                    )}

                                    <span className="ai-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper bot">
                                <div className="msg-bot-avatar">
                                    <Loader2 className="spinner" size={16} />
                                </div>
                                <div className="ai-message-bubble bot loading">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-quick-suggestions">
                        {['Bedroom Quote', 'Kitchen Modular', 'Living Room', 'Go to Inventory'].map((hint) => (
                            <button
                                key={hint}
                                className="hint-chip"
                                onClick={() => handleSend(hint === 'Go to Inventory' ? 'Take me to inventory' : `Make a quote for ${hint}`)}
                                disabled={isLoading}
                            >
                                {hint.includes('Quote') || hint.includes('Room') || hint.includes('Kitchen') ? <Zap size={12} /> : <Search size={12} />}
                                {hint}
                            </button>
                        ))}
                    </div>

                    <div className="ai-input-area">
                        <div className="ai-input-wrapper">
                            <input
                                type="text"
                                placeholder="e.g., Make a quote for a 3BHK living room..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                        </div>
                        <button className="btn-ai-send" onClick={() => handleSend()} disabled={isLoading}>
                            {isLoading ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            )}

            <button
                className={`ai-fab ${isOpen ? 'active' : ''}`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowWelcome(false);
                }}
            >
                {!isOpen && (
                    <div className="sparkle-container">
                        <div className="sparkle s1"></div>
                        <div className="sparkle s2"></div>
                        <div className="sparkle s3"></div>
                    </div>
                )}
                {isOpen ? <X size={28} /> : <Wand2 size={28} />}
            </button>
        </div>
    );
};

export default AIChat;
