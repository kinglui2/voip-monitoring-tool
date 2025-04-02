import React, { useEffect, useRef, useState } from 'react';
import { 
  Phone,
  LineChart,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Headset,
  Clock,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';
import logo from '../assets/images/logo.png';

const LandingPage = () => {
    const navRef = useRef(null);
    const scrollTopRef = useRef(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

        const handleScroll = () => {
            const nav = navRef.current;
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // Calculate scroll progress
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setScrollProgress(scrolled);

            // Show scroll-to-top button only when near bottom (last 20% of the page)
            setShowScrollTop(scrolled > 80);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="landing-container">
            <nav className="landing-nav" ref={navRef}>
                <div className="nav-brand" onClick={scrollToTop}>
<img src={logo} alt="Vetracom Logo" className="nav-logo" />
<h1>Vetracom</h1>
                </div>
                <div className="nav-buttons">
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>
                    <Link to="/register" className="register-btn">
                        Register
                    </Link>
                </div>
            </nav>

            <div className="scroll-progress">
                <div 
                    className="scroll-progress-bar" 
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <button 
                className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                ref={scrollTopRef}
            >
                <svg viewBox="0 0 24 24">
                    <path d="M12 4l-8 8h16z"/>
                </svg>
            </button>

            <section className="hero-section">
                <div className="hero-content animate-on-scroll">
                    <h1>Transform Your VoIP Experience</h1>
                    <p>Monitor, analyze, and optimize your VoIP calls in real-time with our comprehensive monitoring solution</p>
                    <div className="hero-buttons">
                        <Link to="/register" className="cta-button primary">
                            Get Started
                        </Link>
                        <Link to="/login" className="cta-button secondary">
                            Try Demo
                        </Link>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-item animate-on-scroll">
                        <span className="stat-number">99.9%</span>
                        <span className="stat-label">Uptime</span>
                    </div>
                    <div className="stat-item animate-on-scroll">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Monitoring</span>
                    </div>
                    <div className="stat-item animate-on-scroll">
                        <span className="stat-number">1000+</span>
                        <span className="stat-label">Active Users</span>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2 className="animate-on-scroll">Powerful Features</h2>
                <div className="features-grid">
                    <div className="feature-card animate-on-scroll">
                        <Phone className="feature-icon" />
                        <h3>Real-time Call Monitoring</h3>
                        <p>Monitor VoIP calls as they happen with detailed analytics</p>
                        <ul className="feature-list">
                            <li><CheckCircle2 /> Call Quality Tracking</li>
                            <li><CheckCircle2 /> Voice Quality Analysis</li>
                            <li><CheckCircle2 /> Real-time Alerts</li>
                        </ul>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <LineChart className="feature-icon" />
                        <h3>Performance Analytics</h3>
                        <p>Track and analyze call performance metrics</p>
                        <ul className="feature-list">
                            <li><CheckCircle2 /> Detailed Reports</li>
                            <li><CheckCircle2 /> Performance Trends</li>
                            <li><CheckCircle2 /> Custom Dashboards</li>
                        </ul>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <Users className="feature-icon" />
                        <h3>Team Management</h3>
                        <p>Efficiently manage your call center team</p>
                        <ul className="feature-list">
                            <li><CheckCircle2 /> Agent Performance</li>
                            <li><CheckCircle2 /> Team Analytics</li>
                            <li><CheckCircle2 /> Resource Planning</li>
                        </ul>
                    </div>
                    <div className="feature-card animate-on-scroll">
                        <Shield className="feature-icon" />
                        <h3>Secure Access</h3>
                        <p>Enterprise-grade security features</p>
                        <ul className="feature-list">
                            <li><CheckCircle2 /> Role Management</li>
                            <li><CheckCircle2 /> Access Control</li>
                            <li><CheckCircle2 /> Audit Logs</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="benefits-section">
                <h2 className="animate-on-scroll">Why Choose Us</h2>
                <div className="benefits-grid">
                    <div className="benefit-item animate-on-scroll">
                        <Headset className="benefit-icon" />
                        <h3>24/7 Support</h3>
                        <p>Round-the-clock technical support</p>
                    </div>
                    <div className="benefit-item animate-on-scroll">
                        <Clock className="benefit-icon" />
                        <h3>Time Saving</h3>
                        <p>Automated monitoring and reporting</p>
                    </div>
                    <div className="benefit-item animate-on-scroll">
                        <BarChart3 className="benefit-icon" />
                        <h3>Data-Driven</h3>
                        <p>Make informed decisions with analytics</p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content animate-on-scroll">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of satisfied users who trust our VoIP monitoring solution</p>
                    <Link to="/register" className="cta-button primary">
                        Start Free Trial
                        <ArrowRight className="arrow-icon" />
                    </Link>
                </div>
            </section>

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
                            <li>kaylewis377@gmail.com</li>
                            <li>+254111632013</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Vetracom. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
