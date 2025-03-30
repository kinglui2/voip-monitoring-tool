import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isLoggedIn, getUserRole } from './auth'; // Import the isLoggedIn and getUserRole functions

const ProtectedRoute = ({ component: RenderedComponent, roles, ...rest }) => {
    if (!RenderedComponent) {
        console.error('RenderedComponent is not defined');
        return null; // Return null if RenderedComponent is not provided
    }
    const userRole = getUserRole(); // Get the user role

    return ( 
        <Route
            {...rest}
            render={props =>
                isLoggedIn() && roles.includes(userRole) ? ( // Check if user is logged in and has the required role
                    <RenderedComponent {...props} /> // Render the component with props
                ) : (
                    <Redirect to="/login" />
                )
            }
        />
    );
};

export default ProtectedRoute;
