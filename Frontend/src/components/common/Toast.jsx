import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import './css/Toast.css';

const Toast = ({ message, type = 'success', onClose }) => {
    const icons = {
        success: <CheckCircle className="toast-icon success" />,
        error: <XCircle className="toast-icon error" />,
        warning: <AlertCircle className="toast-icon warning" />,
    };

    return (
        <div className={`toast-item ${type}`}>
            <div className="toast-content">
                {icons[type]}
                <span className="toast-message">{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
