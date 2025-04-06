const express = require('express');
const router = express.Router();
const ThreeCXService = require('../services/threeCXService');
const YeastarService = require('../services/yeastarService');
const authenticateToken = require('../middleware/authMiddleware');

// Initialize PBX services
const threeCXService = new ThreeCXService();
const yeastarService = new YeastarService();

// Apply authentication middleware to all routes
router.use(authenticateToken);

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