import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`error-message ${!isVisible ? 'fade-out' : ''}`}>
            <p>{message}</p>
            <button onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }}>
                <FaTimes />
            </button>
        </div>
    );
};

export default ErrorMessage; 