const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
console.log('Environment Variables:', process.env); // Log all environment variables

const app = express();
const authRoutes = require('./routes/auth');
const errorMiddleware = require('./middleware/errorMiddleware'); // Import error handling middleware
const http = require('http');
const { Server } = require('socket.io'); // Importing Socket.io
const server = http.createServer(app); // Creating HTTP server
const io = new Server(server); // Initializing Socket.io with the server
const callRoutes = require('./routes/calls'); // Importing call routes
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

app.use('/api/auth', authRoutes);
app.use('/api/calls', callRoutes); // Mounting call routes

app.use(errorMiddleware); // Use error handling middleware

// Basic API route
app.get('/', (req, res) => {
  res.send('VoIP Monitoring Tool Backend Running...');
});

// Start the server with Socket.io integration
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
