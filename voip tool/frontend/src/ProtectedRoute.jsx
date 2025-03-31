import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, getUserRole } from './auth'; // Import the isLoggedIn and getUserRole functions

const ProtectedRoute = ({ children, roles }) => {
    const userRole = getUserRole(); // Get the user role
    const loggedIn = isLoggedIn(); // Check if user is logged in

    console.log('User role:', userRole); // Log the user role
    console.log('Is user logged in:', loggedIn); // Log the login status
    console.log('Roles required:', roles); // Log the required roles
    console.log('Is user authorized:', loggedIn && roles.includes(userRole)); // Log the authorization check

    if (!loggedIn || !roles.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
