import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // Set the base URL for the API
});

// Example function to fetch calls
export const fetchCalls = async () => {
    const response = await api.get('/calls');
    return response.data;
};

// Add more API functions as needed

export default api;
