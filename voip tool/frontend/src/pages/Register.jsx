import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import '../styles/animations.css';
import { FaUser, FaLock, FaSun, FaMoon, FaEye, FaEyeSlash, FaCheck, FaTimes, FaPhone, FaBuilding } from "react-icons/fa";
import logo from '../assets/images/logo.png';
import ErrorMessage from '../components/shared/ErrorMessage';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        organization: ''
    });
    const [error, setError] = useState('');
    const [isDark, setIsDark] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validation, setValidation] = useState({
        username: { isValid: false, message: '' },
        email: { isValid: false, message: '' },
        password: { isValid: false, message: '' },
        confirmPassword: { isValid: false, message: '' },
        phoneNumber: { isValid: false, message: '' },
        organization: { isValid: false, message: '' }
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setIsDark(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

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

    const validatePhoneNumber = (value) => {
        if (!value) {
            return { isValid: false, message: 'Phone number is required' };
        }
        if (!/^\+?[\d\s-]{10,}$/.test(value)) {
            return { isValid: false, message: 'Please enter a valid phone number' };
        }
        return { isValid: true, message: '' };
    };

    const validateOrganization = (value) => {
        if (!value) {
            return { isValid: false, message: 'Organization is required' };
        }
        if (value.length < 2) {
            return { isValid: false, message: 'Organization name must be at least 2 characters' };
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
            case 'phoneNumber':
                validationResult = validatePhoneNumber(value);
                break;
            case 'organization':
                validationResult = validateOrganization(value);
                break;
            default:
                validationResult = { isValid: true, message: '' };
        }

        setValidation(prev => ({
            ...prev,
            [name]: validationResult
        }));
    };

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        const validations = {
            username: validateUsername(formData.username),
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword),
            phoneNumber: validatePhoneNumber(formData.phoneNumber),
            organization: validateOrganization(formData.organization)
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
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="app-logo" />
                </div>
                <h2>Create Account</h2>
                <p>Join our VoIP monitoring platform</p>

                {error && error.includes('Registration failed') && (
                    <ErrorMessage 
                        type="full"
                        title="Registration Error"
                        message={error}
                        suggestion="Please check your information and try again"
                        onRetry={() => setError(null)}
                    />
                )}
                
                {error && !error.includes('Registration failed') && (
                    <ErrorMessage 
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label htmlFor="username">Username</label>
                        <div>
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className={validation.username.isValid ? 'valid' : validation.username.message ? 'invalid' : ''}
                                placeholder="Enter your username"
                            />
                            {validation.username.message && (
                                <>
                                    {validation.username.isValid ? (
                                        <FaCheck className="validation-icon valid" />
                                    ) : (
                                        <FaTimes className="validation-icon invalid" />
                                    )}
                                    <span className="validation-message">{validation.username.message}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="input-container">
                        <label htmlFor="email">Email</label>
                        <div>
                            <FaUser className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={validation.email.isValid ? 'valid' : validation.email.message ? 'invalid' : ''}
                                placeholder="Enter your email"
                            />
                            {validation.email.message && (
                                <>
                                    {validation.email.isValid ? (
                                        <FaCheck className="validation-icon valid" />
                                    ) : (
                                        <FaTimes className="validation-icon invalid" />
                                    )}
                                    <span className="validation-message">{validation.email.message}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="input-container">
                        <label htmlFor="password">Password</label>
                        <div>
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={validation.password.isValid ? 'valid' : validation.password.message ? 'invalid' : ''}
                                placeholder="Enter your password"
                            />
                            <span 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                            {validation.password.message && (
                                <>
                                    {validation.password.isValid ? (
                                        <FaCheck className="validation-icon valid" />
                                    ) : (
                                        <FaTimes className="validation-icon invalid" />
                                    )}
                                    <span className="validation-message">{validation.password.message}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="input-container">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div>
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={validation.confirmPassword.isValid ? 'valid' : validation.confirmPassword.message ? 'invalid' : ''}
                                placeholder="Confirm your password"
                            />
                            {validation.confirmPassword.message && (
                                <>
                                    {validation.confirmPassword.isValid ? (
                                        <FaCheck className="validation-icon valid" />
                                    ) : (
                                        <FaTimes className="validation-icon invalid" />
                                    )}
                                    <span className="validation-message">{validation.confirmPassword.message}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="input-container">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <div>
                            <FaPhone className="input-icon" />
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className={validation.phoneNumber.isValid ? 'valid' : validation.phoneNumber.message ? 'invalid' : ''}
                                placeholder="Enter your phone number"
                            />
                            {validation.phoneNumber.message && (
                                <>
                                    {validation.phoneNumber.isValid ? (
                                        <FaCheck className="validation-icon valid" />
                                    ) : (
                                        <FaTimes className="validation-icon invalid" />
                                    )}
                                    <span className="validation-message">{validation.phoneNumber.message}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="input-container">
                        <label htmlFor="organization">Organization</label>
                        <div>
                            <FaBuilding className="input-icon" />
                            <input
                                type="text"
                                id="organization"
                                name="organization"
                                value={formData.organization}
                                onChange={handleInputChange}
                                className={validation.organization.isValid ? 'valid' : validation.organization.message ? 'invalid' : ''}
                                placeholder="Enter your organization"
                            />
                            {validation.organization.message && (
                                <>
                                    {validation.organization.isValid ? (
                                        <FaCheck className="validation-icon valid" />
                                    ) : (
                                        <FaTimes className="validation-icon invalid" />
                                    )}
                                    <span className="validation-message">{validation.organization.message}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || Object.values(validation).some(v => !v.isValid)}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="login-link">
                    Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
                </div>

                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDark ? <FaSun /> : <FaMoon />}
                </button>
            </div>
        </div>
    );
};

export default Register;
