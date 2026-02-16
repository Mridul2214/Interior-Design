import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '../../config/api';

const AISuggestButton = ({ type, field, value, onSuggest, context = {} }) => {
    const [suggesting, setSuggesting] = useState(false);

    const handleSuggest = async () => {
        if (suggesting) return;

        // If it's a description and value is empty, try to use related fields
        let searchValue = value;
        if (!value && field === 'description' && context.itemName) {
            searchValue = `Generate a description for ${context.itemName}`;
        } else if (!value && field === 'notes') {
            searchValue = `Generate notes for ${type}`;
        }

        if (!searchValue && !value) {
            alert('Please provide some initial text or a name to generate a suggestion.');
            return;
        }

        setSuggesting(true);
        try {
            const res = await aiAPI.getSuggestion(type, field, searchValue || value);
            if (res.success) {
                onSuggest(res.suggestion);
            }
        } catch (err) {
            console.error('Suggest error:', err);

            // User-friendly error messages
            if (err.message && err.message.includes('quota')) {
                alert('⚠️ AI Quota Exceeded\n\nThe AI suggestion feature has reached its daily limit. Please try again later or enter the description manually.');
            } else if (err.message && err.message.includes('GEMINI_API_KEY')) {
                alert('⚠️ AI Configuration Error\n\nThe AI feature is not properly configured. Please contact your administrator.');
            } else {
                alert('⚠️ AI Suggestion Failed\n\nUnable to generate suggestion at this time. Please enter the description manually.');
            }
        } finally {
            setSuggesting(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleSuggest}
            style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: suggesting ? '#6366f1' : '#94a3b8',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto'
            }}
            title="Get AI Suggestion"
        >
            {suggesting ? <Loader2 size={14} className="spinner" /> : <Sparkles size={14} />}
        </button>
    );
};

export default AISuggestButton;
