import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaChartLine, FaUsers, FaShieldAlt, FaArrowRight, FaCheckCircle, FaHeadset, FaClock, FaChartBar } from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Add scroll animation class to elements when they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
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
                <div className="hero-content">
                    <h1>Transform Your VoIP Experience</h1>
                    <p>Monitor, analyze, and optimize your VoIP calls in real-time with our comprehensive monitoring solution</p>
                    <div className="hero-buttons">
                        <button onClick={() => navigate('/login')} className="cta-button primary">
                            Get Started
                        </button>
                        <button onClick={() => navigate('/register')} className="cta-button secondary">
                            Try Demo
                        </button>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-number">99.9%</span>
                        <span className="stat-label">Uptime</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Monitoring</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">1000+</span>
                        <span className="stat-label">Active Users</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>Powerful Features</h2>
                <div className="features-grid">
                    <div className="feature-card animate-on-scroll">
                        <FaPhone className="feature-icon" />
                        <h3>Real-time Call Monitoring</h3>
                        <p>Monitor VoIP calls as they happen with detailed analytics and quality metrics</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Call Quality Tracking</li>
                            <li><FaCheckCircle /> Voice Quality Analysis</li>
                            <li><FaCheckCircle /> Real-time Alerts</li>
                        </ul>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <FaChartLine className="feature-icon" />
                        <h3>Performance Analytics</h3>
                        <p>Track and analyze call performance with comprehensive metrics</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Detailed Reports</li>
                            <li><FaCheckCircle /> Performance Trends</li>
                            <li><FaCheckCircle /> Custom Dashboards</li>
                        </ul>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <FaUsers className="feature-icon" />
                        <h3>Team Management</h3>
                        <p>Efficiently manage your call center team with advanced tools</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Agent Performance</li>
                            <li><FaCheckCircle /> Team Analytics</li>
                            <li><FaCheckCircle /> Resource Planning</li>
                        </ul>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <FaShieldAlt className="feature-icon" />
                        <h3>Secure Access</h3>
                        <p>Enterprise-grade security with role-based access control</p>
                        <ul className="feature-list">
                            <li><FaCheckCircle /> Role Management</li>
                            <li><FaCheckCircle /> Access Control</li>
                            <li><FaCheckCircle /> Audit Logs</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <h2>Why Choose Us</h2>
                <div className="benefits-grid">
                    <div className="benefit-item animate-on-scroll">
                        <FaHeadset className="benefit-icon" />
                        <h3>24/7 Support</h3>
                        <p>Round-the-clock technical support to help you succeed</p>
                    </div>
                    <div className="benefit-item animate-on-scroll">
                        <FaClock className="benefit-icon" />
                        <h3>Time Saving</h3>
                        <p>Automated monitoring and reporting saves valuable time</p>
                    </div>
                    <div className="benefit-item animate-on-scroll">
                        <FaChartBar className="benefit-icon" />
                        <h3>Data-Driven</h3>
                        <p>Make informed decisions with comprehensive analytics</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content animate-on-scroll">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of satisfied users who trust our VoIP monitoring solution</p>
                    <button onClick={() => navigate('/register')} className="cta-button primary">
                        Start Free Trial
                        <FaArrowRight className="arrow-icon" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>VOIP Monitoring Tool</h3>
                        <p>Your comprehensive solution for VoIP monitoring and management</p>
                    </div>
                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#benefits">Benefits</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Contact</h3>
                        <ul>
                            <li>support@voipmonitor.com</li>
                            <li>+1 (555) 123-4567</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 VoIP Monitoring Tool. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
