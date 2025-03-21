const express = require('express');
const Call = require('../models/Call');
const router = express.Router();

// Fetch all calls
router.get('/', async (req, res) => {
    try {
        const calls = await Call.find();
        res.status(200).json(calls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch calls.' });
    }
});

// Fetch a single call by ID
router.get('/:id', async (req, res) => {
    try {
        const call = await Call.findById(req.params.id);
        if (!call) {
            return res.status(404).json({ error: 'Call not found.' });
        }
        res.status(200).json(call);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch call.' });
    }
});

// Add a new call
router.post('/', async (req, res) => {
    const { caller, receiver, status, duration } = req.body;
    const newCall = new Call({ caller, receiver, status, duration });

    try {
        const savedCall = await newCall.save();
        res.status(201).json(savedCall);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add call.' });
    }
});

// Update call status
router.put('/:id', async (req, res) => {
    try {
        const updatedCall = await Call.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCall) {
            return res.status(404).json({ error: 'Call not found.' });
        }
        res.status(200).json(updatedCall);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update call.' });
    }
});

// Delete a call
router.delete('/:id', async (req, res) => {
    try {
        const deletedCall = await Call.findByIdAndDelete(req.params.id);
        if (!deletedCall) {
            return res.status(404).json({ error: 'Call not found.' });
        }
        res.status(200).json({ message: 'Call deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete call.' });
    }
});

module.exports = router;
