import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, getUserRole } from './auth'; // Import the isLoggedIn and getUserRole functions

const ProtectedRoute = ({ children, roles }) => {
    console.log('ProtectedRoute rendered with roles:', roles);
    const userRole = getUserRole(); // Get the user role
    const loggedIn = isLoggedIn(); // Check if user is logged in

    console.log('ProtectedRoute Debug:', {
        userRole,
        loggedIn,
        roles,
        isAuthorized: loggedIn && roles.includes(userRole),
        path: window.location.pathname
    });

    if (!loggedIn || !roles.includes(userRole)) {
        console.log('Redirecting to login - Auth check failed');
        return <Navigate to="/login" replace />;
    }

    console.log('Rendering protected content');
    return children;
};

export default ProtectedRoute;
