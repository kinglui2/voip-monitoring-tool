const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');
const authenticateToken = require('../middleware/authMiddleware');
const axios = require('axios');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get system configuration
router.get('/config', async (req, res) => {
    try {
        const config = await SystemConfig.getConfig();
        res.json(config);
    } catch (error) {
        console.error('Error fetching system configuration:', error);
        res.status(500).json({ message: 'Error fetching system configuration' });
    }
});

// Update system configuration
router.put('/config', async (req, res) => {
    try {
        const config = await SystemConfig.getConfig();
        const updatedConfig = await config.updateConfig(req.body);
        res.json(updatedConfig);
    } catch (error) {
        console.error('Error updating system configuration:', error);
        res.status(500).json({ message: 'Error updating system configuration' });
    }
});

// Test PBX connection
router.post('/test-connection/:pbxType', async (req, res) => {
    try {
        const { pbxType } = req.params;
        const config = await SystemConfig.getConfig();
        const integrationConfig = config.integrations[pbxType];

        if (!integrationConfig) {
            return res.status(400).json({ 
                success: false, 
                message: `No configuration found for ${pbxType}` 
            });
        }

        let testUrl;
        if (pbxType === '3cx') {
            testUrl = `${integrationConfig.baseUrl}/api/status`;
        } else if (pbxType === 'yeastar') {
            testUrl = `${integrationConfig.baseUrl}/api/system/status`;
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid PBX type' 
            });
        }

        const response = await axios.get(testUrl, {
            headers: {
                'Authorization': `Bearer ${integrationConfig.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            res.json({ 
                success: true, 
                message: `Successfully connected to ${pbxType}` 
            });
        } else {
            throw new Error('Connection test failed');
        }
    } catch (error) {
        console.error(`Error testing ${req.params.pbxType} connection:`, error);
        res.status(500).json({ 
            success: false, 
            message: `Failed to connect to ${req.params.pbxType}`,
            error: error.message 
        });
    }
});

module.exports = router; 