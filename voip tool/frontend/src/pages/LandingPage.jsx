import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaChartLine, FaUsers, FaShieldAlt } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('LandingPage component mounted');
    }, []);

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-brand">
                    <h1>VOIP Monitoring Tool</h1>
                </div>
                <div className="nav-buttons">
                    <button onClick={() => navigate('/login')} className="login-btn">
                        Login
                    </button>
                    <button onClick={() => navigate('/register')} className="register-btn">
                        Register
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <h1>Welcome to VoIP Monitoring Tool</h1>
                <p>Your comprehensive solution for monitoring and managing VoIP calls in real-time</p>
                <button onClick={() => navigate('/login')} className="cta-button">
                    Get Started
                </button>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>Key Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <FaPhone className="feature-icon" />
                        <h3>Real-time Call Monitoring</h3>
                        <p>Monitor VoIP calls as they happen with detailed analytics</p>
                    </div>
                    <div className="feature-card">
                        <FaChartLine className="feature-icon" />
                        <h3>Performance Analytics</h3>
                        <p>Track call quality and performance metrics</p>
                    </div>
                    <div className="feature-card">
                        <FaUsers className="feature-icon" />
                        <h3>Team Management</h3>
                        <p>Efficiently manage your call center team</p>
                    </div>
                    <div className="feature-card">
                        <FaShieldAlt className="feature-icon" />
                        <h3>Secure Access</h3>
                        <p>Role-based access control for enhanced security</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; 2024 VoIP Monitoring Tool. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
