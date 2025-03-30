const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return token ? true : false; // Check if token exists
};

const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
    return payload.role; // Return the user role from the token
};

const logout = () => {
    localStorage.removeItem('token'); // Clear the token
    window.location.href = '/login'; // Redirect to login page
};

export { isLoggedIn, logout };
