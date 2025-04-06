const express = require('express');
const helmet = require('helmet'); // Import helmet for security
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
console.log('Environment Variables:', process.env); // Log all environment variables
const http = require('http');
const socketIo = require('socket.io');
const ReportsWebSocketServer = require('./websocket/reportsServer');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const systemRoutes = require('./routes/system');
const billingRoutes = require('./routes/billingRoutes');
const backupRoutes = require('./routes/backupRoutes');
const pbxRoutes = require('./routes/pbx');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(helmet()); // Use helmet to set security headers

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
}));
app.use(express.json());

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// MongoDB connection
console.log('MongoDB URI:', process.env.MONGODB_URI); // Log the MongoDB URI
if (!process.env.MONGODB_URI) {
    console.error('MongoDB URI is not defined in the environment variables.');
    process.exit(1); // Exit the application if the URI is not defined
}
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true 
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const protectedRoutes = require('./routes/protected');
const callRoutes = require('./routes/calls');
const errorMiddleware = require('./middleware/errorMiddleware'); // Import error handling middleware

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/calls', callRoutes); // Mounting call routes
app.use('/api/protected', protectedRoutes); // Mount protected routes
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/system', systemRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/backups', apiLimiter, backupRoutes);
app.use('/api/pbx', pbxRoutes); // Mount PBX routes
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes

// Basic API route
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

// Error handling middleware should be last
app.use(errorMiddleware);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Initialize WebSocket server
const wss = new ReportsWebSocketServer(server);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Emit events for call updates
        socket.on('callCreated', (call) => {
            io.emit('callCreated', call);
        });

        socket.on('callUpdated', (call) => {
            io.emit('callUpdated', call);
        });

        socket.on('callDeleted', (callId) => {
            io.emit('callDeleted', callId);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
});
