const request = require('supertest');
const User = require('./models/User'); // Import User model
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const app = express();
require('dotenv').config(); // Load environment variables

app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
    // Connect to MongoDB before running tests
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
});

afterAll(async () => {
    // Close the MongoDB connection after tests
    await mongoose.connection.close();
});

describe('Auth Routes', () => {
    it('should signup a new user', async () => {
        await User.deleteMany({}); // Clear users before signup
        const response = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testuser',
                password: 'testpassword',
                email: 'testuser@example.com',
                role: 'Agent'
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
    });

    it('should not signup a user with an existing username', async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testuser',
                password: 'testpassword',
                email: 'testuser@example.com',
                role: 'Agent'
            });

        const response = await request(app)
            .post('/api/auth/signup')
            .send({
                username: 'testuser',
                password: 'testpassword',
                email: 'testuser2@example.com',
                role: 'Agent'
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'User already exists');
    });
});
