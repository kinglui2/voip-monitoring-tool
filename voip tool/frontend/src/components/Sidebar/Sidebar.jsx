import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
    FaUsers, 
    FaCog, 
    FaChartBar, 
    FaFileAlt, 
    FaCreditCard, 
    FaDatabase,
    FaServer,
    FaBars
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/admin/users', icon: <FaUsers />, label: 'User Management' },
        { path: '/admin/system', icon: <FaCog />, label: 'System Config' },
        { path: '/admin/reports', icon: <FaFileAlt />, label: 'Reports' },
        { path: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
        { path: '/admin/billing', icon: <FaCreditCard />, label: 'Billing' },
        { path: '/admin/backup', icon: <FaDatabase />, label: 'Backup & Recovery' },
        { path: '/admin/system-ops', icon: <FaServer />, label: 'System Operations' }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <h1 className="brand">Vetracom</h1>
                <button 
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <FaBars />
                </button>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => 
                            isActive ? 'nav-item active' : 'nav-item'
                        }
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar; 