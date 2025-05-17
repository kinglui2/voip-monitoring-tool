import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', // Use environment variable for base URL
});

// Example function to fetch calls
export const fetchCalls = async () => {
    const response = await api.get('/calls');
    return response.data;
};

// Add more API functions as needed

export default api;
