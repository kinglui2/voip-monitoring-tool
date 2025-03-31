const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

const app = express();

// Initialize the application
const initializeApp = async () => {
    try {
        // Connect to MongoDB first
        console.log('Initializing database connection...');
        await connectDB();
        
        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error.message);
        process.exit(1);
    }
};

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));
app.use(express.json());

// Root route handler
app.get('/', (req, res) => {
    res.json({
        message: 'VoIP Monitoring Tool API Server',
        status: 'running',
        endpoints: {
            login: '/api/auth/login',
            register: '/api/auth/register'
        },
        frontend: 'http://localhost:5173'
    });
});

// Routes
const authRoutes = require('./backend/routes/auth.js');
app.use('/api/auth', authRoutes);

// Start the application
initializeApp().catch(err => {
    console.error('Unhandled error during initialization:', err);
    process.exit(1);
});
