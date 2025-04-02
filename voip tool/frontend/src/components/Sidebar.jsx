import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaCog, FaChartBar, FaFileAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin', icon: <FaHome />, label: 'Dashboard' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
        { path: '/admin/system', icon: <FaCog />, label: 'System Config' },
        { path: '/admin/reports', icon: <FaFileAlt />, label: 'Reports' },
        { path: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
        { path: '/admin/billing', icon: <FaFileInvoiceDollar />, label: 'Billing' }
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>VoIP Monitor</h2>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar; 