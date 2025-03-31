const isLoggedIn = () => {
    console.log('Checking if user is logged in...'); // Log the check
    const token = localStorage.getItem('token');
    return token ? true : false;
};

const getUserRole = () => {
    console.log('Getting user role...'); // Log the role retrieval
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
        const userData = JSON.parse(user);
        return userData.role;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

const getUser = () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
        return JSON.parse(user);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export { isLoggedIn, getUserRole, getUser, logout };
