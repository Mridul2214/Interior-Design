import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import 'react-day-picker/style.css';
import './css/DatePicker.css';

/**
 * DatePicker — shadcn/ui-inspired single-date picker
 *
 * Props:
 *   value      : string  'yyyy-MM-dd'   (controlled)
 *   onChange   : (string) => void       receives 'yyyy-MM-dd'
 *   placeholder: string
 *   disabled   : bool
 *   minDate    : Date
 *   maxDate    : Date
 */
const DatePicker = ({
    value,
    onChange,
    placeholder = 'Pick a date',
    disabled = false,
    minDate,
    maxDate,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Parse value string → Date
    const selectedDate = value
        ? parse(value, 'yyyy-MM-dd', new Date())
        : undefined;
    const validDate = selectedDate && isValid(selectedDate) ? selectedDate : undefined;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (date) => {
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'));
            setOpen(false);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const disabledDays = [];
    if (minDate) disabledDays.push({ before: minDate });
    if (maxDate) disabledDays.push({ after: maxDate });

    return (
        <div className="dp-wrapper" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                className={`dp-trigger${open ? ' open' : ''}${disabled ? ' dp-disabled' : ''}`}
                onClick={() => !disabled && setOpen(o => !o)}
            >
                <CalendarDays size={15} className="dp-cal-icon" />
                <span className={validDate ? 'dp-label' : 'dp-placeholder'}>
                    {validDate ? format(validDate, 'dd MMM yyyy') : placeholder}
                </span>
                {validDate && !disabled && (
                    <span className="dp-clear" onClick={handleClear} title="Clear">
                        <X size={13} />
                    </span>
                )}
            </button>

            {/* Popover */}
            {open && (
                <div className="dp-popover">
                    <DayPicker
                        mode="single"
                        selected={validDate}
                        onSelect={handleSelect}
                        defaultMonth={validDate || new Date()}
                        disabled={disabledDays.length ? disabledDays : undefined}
                        showOutsideDays
                        components={{
                            Chevron: ({ orientation }) =>
                                orientation === 'left'
                                    ? <ChevronLeft size={16} />
                                    : <ChevronRight size={16} />,
                        }}
                    />
                    <div className="dp-footer">
                        <button
                            type="button"
                            className="dp-footer-btn clear"
                            onClick={() => { onChange(''); setOpen(false); }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            className="dp-footer-btn today"
                            onClick={() => { handleSelect(new Date()); }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
