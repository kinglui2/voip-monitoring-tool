import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Importing the new CSS file for styling
import '../styles/animations.css';
import { FaUser, FaLock, FaSun, FaMoon, FaEye, FaEyeSlash, FaCheck, FaTimes, FaSpinner } from "react-icons/fa"; // Importing icons for user and lock
import logo from '../assets/images/logo.png';
import ErrorMessage from '../components/shared/ErrorMessage';
import { ThemeContext } from '../context/ThemeContext';

const Login = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validation, setValidation] = useState({
        username: { isValid: false, message: '' },
        password: { isValid: false, message: '' }
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

    const validatePassword = (value) => {
        if (!value) {
            return { isValid: false, message: 'Password is required' };
        }
        if (value.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters' };
        }
        return { isValid: true, message: '' };
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            username: value
        }));
        setValidation(prev => ({
            ...prev,
            username: validateUsername(value)
        }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            password: value
        }));
        setValidation(prev => ({
            ...prev,
            password: validatePassword(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted with data:', formData);

        const usernameValidation = validateUsername(formData.username);
        const passwordValidation = validatePassword(formData.password);
        
        setValidation({
            username: usernameValidation,
            password: passwordValidation
        });

        if (!usernameValidation.isValid || !passwordValidation.isValid) {
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            console.log('Sending login request to:', 'http://localhost:5000/api/auth/login');
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response from login API:', data);
            
            if (response.ok) {
                console.log('Login successful, storing token and user data');
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('Token and user data stored in local storage:', {
                    token: data.token,
                    user: data.user
                });
                
                if (data.user.role === 'Admin') {
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin/dashboard');
                } else if (data.user.role === 'Supervisor') {
                    console.log('Redirecting to supervisor dashboard');
                    navigate('/supervisor/dashboard');
                } else {
                    console.log('Redirecting to regular dashboard');
                    navigate('/dashboard');
                }
            } else {
                console.log('Login failed with error:', data.error);
                setError(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Network error during login:', error);
            setError(`Network error: ${error.message || 'Please check your connection and try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
            >
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
            <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="logo-container">
                    <img 
                        src={logo} 
                        alt="VoIP Monitoring Tool Logo" 
                        className="app-logo"
                        onError={(e) => {
                            console.warn('Logo failed to load');
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
                <h2>Welcome Back!</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
                    Please login to access your VoIP monitoring dashboard
                </p>
                <div className="input-container">
                    <label htmlFor="username">Username</label>
                    <div>
                        <FaUser className="input-icon" /> {/* User icon */}
                        <input 
                            id="username"
                            type="text" 
                            value={formData.username} 
                            onChange={handleUsernameChange}
                            placeholder="Enter your username"
                            disabled={loading}
                            className={validation.username.message ? 'invalid' : validation.username.isValid ? 'valid' : ''}
                        />
                        {validation.username.isValid && <FaCheck className="validation-icon valid" />}
                        {validation.username.message && <FaTimes className="validation-icon invalid" />}
                    </div>
                    {validation.username.message && <span className="validation-message">{validation.username.message}</span>}
                </div>
                <div className="input-container">
                    <label htmlFor="password">Password</label>
                    <div>
                        <FaLock className="input-icon" /> {/* Lock icon */}
                        <input 
                            id="password"
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            onChange={handlePasswordChange}
                            placeholder="Enter your password"
                            disabled={loading}
                            className={validation.password.message ? 'invalid' : validation.password.isValid ? 'valid' : ''}
                        />
                        <span 
                            className="password-toggle"
                            onClick={() => !loading && setShowPassword(!showPassword)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (!loading && (e.key === 'Enter' || e.key === ' ')) {
                                    setShowPassword(!showPassword);
                                }
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                        {validation.password.isValid && <FaCheck className="validation-icon valid" />}
                        {validation.password.message && <FaTimes className="validation-icon invalid" />}
                    </div>
                    {validation.password.message && <span className="validation-message">{validation.password.message}</span>}
                </div>
                
                {error && (error.includes('Invalid credentials') || error.includes('User not found')) && (
                    <ErrorMessage 
                        type="full"
                        title="Authentication Failed"
                        message={error}
                        suggestion="Please check your email and password and try again"
                        onRetry={() => setError(null)}
                    />
                )}
                
                {error && !error.includes('Invalid credentials') && !error.includes('User not found') && (
                    <ErrorMessage 
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                <button 
                    type="submit" 
                    className={`login-button ${loading ? 'loading' : ''}`}
                    disabled={loading || !validation.username.isValid || !validation.password.isValid}
                >
                    {loading ? <FaSpinner className="spinner" /> : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
