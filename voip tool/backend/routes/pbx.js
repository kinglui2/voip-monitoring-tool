const express = require('express');
const router = express.Router();
const ThreeCXService = require('../services/threeCXService');
const YeastarService = require('../services/yeastarService');
const PBXConfig = require('../models/PBXConfig');
const authenticateToken = require('../middleware/authMiddleware');

// Initialize PBX services
const threeCXService = new ThreeCXService();
const yeastarService = new YeastarService();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all PBX configurations
router.get('/configs', async (req, res) => {
    try {
        const configs = await PBXConfig.find();
        res.json(configs);
    } catch (error) {
        console.error('Error fetching PBX configurations:', error);
        res.status(500).json({ error: 'Failed to fetch PBX configurations' });
    }
});

// Get active PBX configuration
router.get('/active', async (req, res) => {
    try {
        const activePBX = await PBXConfig.findOne({ isActive: true });
        res.json(activePBX || { message: 'No active PBX configuration' });
    } catch (error) {
        console.error('Error fetching active PBX:', error);
        res.status(500).json({ error: 'Failed to fetch active PBX' });
    }
});

// Create new PBX configuration
router.post('/config', async (req, res) => {
    try {
        const { type, config } = req.body;
        
        // Validate PBX type
        if (!['3cx', 'yeastar'].includes(type)) {
            return res.status(400).json({ error: 'Invalid PBX type' });
        }

        // If this is the first configuration, set it as active
        const existingConfigs = await PBXConfig.countDocuments();
        const isActive = existingConfigs === 0;

        const pbxConfig = new PBXConfig({
            type,
            config,
            isActive
        });

        await pbxConfig.save();
        res.status(201).json(pbxConfig);
    } catch (error) {
        console.error('Error creating PBX configuration:', error);
        res.status(500).json({ error: 'Failed to create PBX configuration' });
    }
});

// Switch active PBX
router.post('/switch/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the target PBX configuration
        const targetPBX = await PBXConfig.findById(id);
        if (!targetPBX) {
            return res.status(404).json({ error: 'PBX configuration not found' });
        }

        // Start a session for transaction
        const session = await PBXConfig.startSession();
        session.startTransaction();

        try {
            // Deactivate all PBX configurations
            await PBXConfig.updateMany(
                { _id: { $ne: id } },
                { $set: { isActive: false } },
                { session }
            );

            // Activate the target PBX
            targetPBX.isActive = true;
            targetPBX.lastConnected = new Date();
            await targetPBX.save({ session });

            // Initialize the appropriate service
            let service;
            if (targetPBX.type === '3cx') {
                service = threeCXService;
            } else if (targetPBX.type === 'yeastar') {
                service = yeastarService;
            }

            // Connect to the PBX
            await service.connect(targetPBX.config);

            await session.commitTransaction();
            res.json({ 
                message: `Switched to ${targetPBX.type} PBX`,
                pbx: targetPBX 
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error switching PBX:', error);
        res.status(500).json({ error: 'Failed to switch PBX' });
    }
});

// Update PBX configuration
router.put('/config/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { config } = req.body;

        const pbxConfig = await PBXConfig.findByIdAndUpdate(
            id,
            { $set: { config } },
            { new: true }
        );

        if (!pbxConfig) {
            return res.status(404).json({ error: 'PBX configuration not found' });
        }

        res.json(pbxConfig);
    } catch (error) {
        console.error('Error updating PBX configuration:', error);
        res.status(500).json({ error: 'Failed to update PBX configuration' });
    }
});

// Delete PBX configuration
router.delete('/config/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const pbxConfig = await PBXConfig.findById(id);
        if (!pbxConfig) {
            return res.status(404).json({ error: 'PBX configuration not found' });
        }

        // Don't allow deletion of the last active PBX
        if (pbxConfig.isActive) {
            const otherConfigs = await PBXConfig.countDocuments({ _id: { $ne: id } });
            if (otherConfigs === 0) {
                return res.status(400).json({ error: 'Cannot delete the last active PBX configuration' });
            }
        }

        await pbxConfig.remove();
        res.json({ message: 'PBX configuration deleted successfully' });
    } catch (error) {
        console.error('Error deleting PBX configuration:', error);
        res.status(500).json({ error: 'Failed to delete PBX configuration' });
    }
});

// Get 3CX metrics
router.get('/3cx/metrics', async (req, res) => {
    try {
        const metrics = await threeCXService.getMetrics();
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching 3CX metrics:', error);
        res.status(500).json({ error: 'Failed to fetch 3CX metrics' });
    }
});

// Get Yeastar metrics
router.get('/yeastar/metrics', async (req, res) => {
    try {
        const metrics = await yeastarService.getMetrics();
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching Yeastar metrics:', error);
        res.status(500).json({ error: 'Failed to fetch Yeastar metrics' });
    }
});

// Get 3CX status
router.get('/3cx/status', async (req, res) => {
    try {
        const status = await threeCXService.getSystemStatus();
        res.json(status);
    } catch (error) {
        console.error('Error fetching 3CX status:', error);
        res.status(500).json({ error: 'Failed to fetch 3CX status' });
    }
});

// Get Yeastar status
router.get('/yeastar/status', async (req, res) => {
    try {
        const status = await yeastarService.getSystemStatus();
        res.json(status);
    } catch (error) {
        console.error('Error fetching Yeastar status:', error);
        res.status(500).json({ error: 'Failed to fetch Yeastar status' });
    }
});

// Get 3CX logs
router.get('/3cx/logs', async (req, res) => {
    try {
        const logs = await threeCXService.getSystemLogs();
        res.json(logs);
    } catch (error) {
        console.error('Error fetching 3CX logs:', error);
        res.status(500).json({ error: 'Failed to fetch 3CX logs' });
    }
});

// Get Yeastar logs
router.get('/yeastar/logs', async (req, res) => {
    try {
        const logs = await yeastarService.getSystemLogs();
        res.json(logs);
    } catch (error) {
        console.error('Error fetching Yeastar logs:', error);
        res.status(500).json({ error: 'Failed to fetch Yeastar logs' });
    }
});

// Perform maintenance actions
router.post('/maintenance', async (req, res) => {
    try {
        const { action } = req.body;
        let result;

        switch (action) {
            case 'clearCache':
                // Clear cache on both systems
                await Promise.all([
                    threeCXService.clearCache(),
                    yeastarService.clearCache()
                ]);
                result = { success: true, message: 'System cache cleared successfully' };
                break;

            case 'restartServices':
                // Restart services on both systems
                await Promise.all([
                    threeCXService.restartServices(),
                    yeastarService.restartServices()
                ]);
                result = { success: true, message: 'Services restarted successfully' };
                break;

            case 'emergencyStop':
                // Emergency stop on both systems
                await Promise.all([
                    threeCXService.emergencyStop(),
                    yeastarService.emergencyStop()
                ]);
                result = { success: true, message: 'Emergency stop initiated' };
                break;

            default:
                return res.status(400).json({ error: 'Invalid maintenance action' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error performing maintenance action:', error);
        res.status(500).json({ error: 'Failed to perform maintenance action' });
    }
});

module.exports = router; 