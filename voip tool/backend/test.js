const request = require('supertest');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
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
    await User.deleteMany({}); // Clear users before tests
});

afterAll(async () => {
    // Close the MongoDB connection after tests
    await mongoose.connection.close();
});

describe('Auth Routes', () => {
    it('should signup a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
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
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'testpassword',
                email: 'testuser@example.com',
                role: 'Agent'
            });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'testpassword',
                email: 'testuser2@example.com',
                role: 'Agent'
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'User already exists');
    });

    it('should login a user with valid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should not login a user with invalid username', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'invaliduser',
                password: 'testpassword'
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    it('should not login a user with incorrect password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid username or password');
    });

    // Role-based Access Tests
    it('should allow Admin to access admin route', async () => {
        // Create an Admin user
        const adminUser = new User({
            username: 'adminuser',
            password: await bcrypt.hash('adminpassword', 10), // Hash the password
            email: 'admin@example.com',
            role: 'Admin' // Set role to Admin
        });
        await adminUser.save();

        // Login as Admin
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'adminuser',
                password: 'adminpassword'
            });

        const token = loginResponse.body.token;

        // Attempt to access an admin-only route
        const response = await request(app)
            .get('/api/protected/admin') // Corrected path for the protected admin route
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200); // Expect success
    });

    it('should not allow Agent to access admin route', async () => {
        // Login as Agent
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });

        const token = loginResponse.body.token;

        // Attempt to access an admin-only route
        const response = await request(app)
            .get('/api/protected/admin') // Corrected path for the protected admin route
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(403); // Expect forbidden
        expect(response.body).toHaveProperty('error', 'Access denied. Insufficient permissions.');
    });

    it('should allow Agent to access general route', async () => {
        // Login as Agent
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'testpassword'
            });

        const token = loginResponse.body.token;

        // Attempt to access a general route
        const response = await request(app)
            .get('/api/protected/general') // Corrected path for the protected general route
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200); // Expect success
    });
});
