import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import 'react-day-picker/style.css';
import './DateRangePicker.css';

/**
 * DateRangePicker
 * Props:
 *   value   : { from: Date|null, to: Date|null }
 *   onChange: (range) => void
 *   placeholder: string  (optional)
 *   minDate : Date       (optional)
 */
const DateRangePicker = ({ value, onChange, placeholder = 'Pick a date range', minDate }) => {
    const [open, setOpen] = useState(false);
    const ref  = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const label = value?.from
        ? value.to
            ? `${format(value.from, 'dd MMM yyyy')}  →  ${format(value.to, 'dd MMM yyyy')}`
            : format(value.from, 'dd MMM yyyy')
        : null;

    const clear = (e) => { e.stopPropagation(); onChange({ from: null, to: null }); };

    return (
        <div className="drp-wrapper" ref={ref}>
            {/* Trigger button */}
            <button type="button" className={`drp-trigger${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
                <CalendarIcon size={15} className="drp-icon" />
                <span className={label ? 'drp-label' : 'drp-placeholder'}>
                    {label || placeholder}
                </span>
                {label && (
                    <span className="drp-clear" onClick={clear} title="Clear">
                        <X size={13} />
                    </span>
                )}
            </button>

            {/* Popover calendar */}
            {open && (
                <div className="drp-popover">
                    <DayPicker
                        mode="range"
                        selected={value?.from ? value : undefined}
                        onSelect={(range) => {
                            onChange(range || { from: null, to: null });
                            // Close once a full range is selected
                            if (range?.from && range?.to) setOpen(false);
                        }}
                        numberOfMonths={2}
                        defaultMonth={value?.from || new Date()}
                        disabled={minDate ? { before: minDate } : undefined}
                        showOutsideDays
                    />
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
