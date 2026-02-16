import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import './css/CustomSelect.css';

const CustomSelect = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    disabled = false,
    name,
    required = false,
    searchable = true,
    error = false,
    variant = 'default' // 'default' or 'inline'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInlineStyles = () => {
        if (variant !== 'inline') return {};

        // Dynamic color coding for status if using inline
        if (value === 'Completed') return { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#dcfce7' };
        if (value === 'In Progress') return { backgroundColor: '#eff6ff', color: '#3b82f6', borderColor: '#dbeafe' };
        if (value === 'To Do') return { backgroundColor: '#fff7ed', color: '#f97316', borderColor: '#ffedd5' };
        if (value === 'Blocked') return { backgroundColor: '#fef2f2', color: '#ef4444', borderColor: '#fee2e2' };
        return {};
    };

    return (
        <div className={`custom-select-container ${variant} ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
            {label && (
                <label className="custom-select-label">
                    {label} {required && <span className="required">*</span>}
                </label>
            )}

            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
                onClick={handleToggle}
                style={getInlineStyles()}
            >
                <div className="trigger-content">
                    {selectedOption ? (
                        <span className="selected-value" style={variant === 'inline' ? { color: 'inherit' } : {}}>{selectedOption.label}</span>
                    ) : (
                        <span className="placeholder">{placeholder}</span>
                    )}
                </div>
                <div className="trigger-icons">
                    {isOpen ? <ChevronUp size={variant === 'inline' ? 14 : 18} /> : <ChevronDown size={variant === 'inline' ? 14 : 18} />}
                </div>
            </div>

            {isOpen && (
                <div className="custom-select-dropdown" data-lenis-prevent>
                    {searchable && (
                        <div className="select-search-container">
                            <Search size={14} className="search-icon" />
                            <input
                                type="text"
                                className="select-search-input"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    )}
                    <ul className="options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <li
                                    key={option.value}
                                    className={`option-item ${option.value === value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                    {option.value === value && (
                                        <div className="selected-indicator" />
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="no-options">No options found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
