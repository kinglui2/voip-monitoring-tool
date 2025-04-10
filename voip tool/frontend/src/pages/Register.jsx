import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import '../styles/animations.css';
import { FaUser, FaLock, FaSun, FaMoon, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import logo from '../assets/images/logo.png';
import ErrorMessage from '../components/shared/ErrorMessage';
import { ThemeContext } from '../context/ThemeContext';

const Register = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validation, setValidation] = useState({
        username: { isValid: false, message: '' },
        email: { isValid: false, message: '' },
        password: { isValid: false, message: '' },
        confirmPassword: { isValid: false, message: '' }
    });

    const validateUsername = (value) => {
        if (!value) {
            return { isValid: false, message: 'Username is required' };
        }
        if (value.length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
        }
        return { isValid: true, message: '' };
    };

    const validateEmail = (value) => {
        if (!value) {
            return { isValid: false, message: 'Email is required' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        return { isValid: true, message: '' };
    };

    const validatePassword = (value) => {
        if (!value) {
            return { isValid: false, message: 'Password is required' };
        }
        if (value.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters' };
        }
        return { isValid: true, message: '' };
    };

    const validateConfirmPassword = (value) => {
        if (!value) {
            return { isValid: false, message: 'Please confirm your password' };
        }
        if (value !== formData.password) {
            return { isValid: false, message: 'Passwords do not match' };
        }
        return { isValid: true, message: '' };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        let validationResult;
        switch (name) {
            case 'username':
                validationResult = validateUsername(value);
                break;
            case 'email':
                validationResult = validateEmail(value);
                break;
            case 'password':
                validationResult = validatePassword(value);
                break;
            case 'confirmPassword':
                validationResult = validateConfirmPassword(value);
                break;
            default:
                validationResult = { isValid: true, message: '' };
        }

        setValidation(prev => ({
            ...prev,
            [name]: validationResult
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        const validations = {
            username: validateUsername(formData.username),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword)
        };

        setValidation(validations);

        // Check if all validations pass
        const isValid = Object.values(validations).every(v => v.isValid);
        if (!isValid) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
            >
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
            
            <div className="register-form">
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="app-logo" />
                </div>
                <h2>Create Account</h2>
                <p>Join our VoIP monitoring platform</p>

                {error && (
                    <ErrorMessage 
                        type="full"
                        title="Registration Error"
                        message={error}
                    />
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className={validation.username.isValid ? 'valid' : validation.username.message ? 'invalid' : ''}
                            />
                            {validation.username.isValid && <FaCheck className="valid-icon" />}
                            {validation.username.message && <FaTimes className="invalid-icon" />}
                        </div>
                        {validation.username.message && (
                            <span className="error-message">{validation.username.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={validation.email.isValid ? 'valid' : validation.email.message ? 'invalid' : ''}
                            />
                            {validation.email.isValid && <FaCheck className="valid-icon" />}
                            {validation.email.message && <FaTimes className="invalid-icon" />}
                        </div>
                        {validation.email.message && (
                            <span className="error-message">{validation.email.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={validation.password.isValid ? 'valid' : validation.password.message ? 'invalid' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {validation.password.isValid && <FaCheck className="valid-icon" />}
                            {validation.password.message && <FaTimes className="invalid-icon" />}
                        </div>
                        {validation.password.message && (
                            <span className="error-message">{validation.password.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={validation.confirmPassword.isValid ? 'valid' : validation.confirmPassword.message ? 'invalid' : ''}
                            />
                            {validation.confirmPassword.isValid && <FaCheck className="valid-icon" />}
                            {validation.confirmPassword.message && <FaTimes className="invalid-icon" />}
                        </div>
                        {validation.confirmPassword.message && (
                            <span className="error-message">{validation.confirmPassword.message}</span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="login-link">
                    Already have an account? <a href="/login">Login here</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
