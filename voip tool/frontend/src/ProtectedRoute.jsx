import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isLoggedIn, getUserRole } from './auth'; // Import the isLoggedIn and getUserRole functions

const ProtectedRoute = ({ component: RenderedComponent, roles, ...rest }) => {
    if (!RenderedComponent) {
        console.error('RenderedComponent is not defined');
        return null; // Return null if RenderedComponent is not provided
    }
    const userRole = getUserRole(); // Get the user role
    const loggedIn = isLoggedIn(); // Check if user is logged in

    console.log('User role:', userRole); // Log the user role
    console.log('Is user logged in:', loggedIn); // Log the login status
    console.log('Roles required:', roles); // Log the required roles
    console.log('Is user authorized:', loggedIn && roles.includes(userRole)); // Log the authorization check

    return ( 
        <Route
            {...rest}
            render={props =>
                loggedIn && roles.includes(userRole) ? ( // Check if user is logged in and has the required role
                    <RenderedComponent {...props} /> // Render the component with props
                ) : (
                    <Redirect to="/login" />
                )
            }
        />
    );
};

export default ProtectedRoute;
