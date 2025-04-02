const express = require('express');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Get all users (Admin only)
router.get('/', roleMiddleware(['Admin']), async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from response
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Error retrieving users' });
    }
});

// Create new user (Admin only)
router.post('/', roleMiddleware(['Admin']), async (req, res) => {
    const { username, password, email, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ username, password, email, role });
        await newUser.save();
        
        // Return user without password
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({ message: 'User created successfully', user: userResponse });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
});

// Update user (Admin only)
router.put('/:id', roleMiddleware(['Admin']), async (req, res) => {
    try {
        const { username, email, role, password } = req.body;
        const updateData = { username, email, role };
        
        // Only include password in update if provided
        if (password) {
            updateData.password = password;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});

// Delete user (Admin only)
router.delete('/:id', roleMiddleware(['Admin']), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(400).json({ message: 'Error deleting user', error: error.message });
    }
});

// Reset user password (Admin only)
router.post('/:id/reset-password', roleMiddleware(['Admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a random password
        const newPassword = Math.random().toString(36).slice(-8);
        user.password = newPassword;
        await user.save();

        // TODO: Send email with new password
        // For now, just return the password in the response
        res.status(200).json({ 
            message: 'Password reset successfully',
            newPassword // In production, this should be sent via email instead
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).json({ message: 'Error resetting password', error: error.message });
    }
});

module.exports = router;
