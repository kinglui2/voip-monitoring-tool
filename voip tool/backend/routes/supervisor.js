const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const SupervisorService = require('../services/supervisorService');
const ThreeCXService = require('../services/threeCXService');
const YeastarService = require('../services/yeastarService');
const PBXConfig = require('../models/PBXConfig');

// Initialize PBX services
const threeCXService = new ThreeCXService();
const yeastarService = new YeastarService();

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(roleMiddleware(['Supervisor']));

// Initialize supervisor service with active PBX
router.use(async (req, res, next) => {
    try {
        const activePBX = await PBXConfig.findOne({ isActive: true });
        if (!activePBX) {
            return res.status(503).json({ error: 'No active PBX configuration found' });
        }

        const pbxService = activePBX.type === '3cx' ? threeCXService : yeastarService;
        req.supervisorService = new SupervisorService(pbxService);
        await req.supervisorService.initialize();
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize supervisor service' });
    }
});

// Team Management Routes
router.get('/team/status', async (req, res) => {
    try {
        const result = await req.supervisorService.getTeamStatus();
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team status' });
    }
});

// Call Monitoring Routes
router.get('/calls/active', async (req, res) => {
    try {
        const result = await req.supervisorService.getActiveCalls();
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active calls' });
    }
});

// Performance Analytics Routes
router.get('/metrics/team', async (req, res) => {
    try {
        const { startTime, endTime } = req.query;
        const result = await req.supervisorService.getTeamMetrics(startTime, endTime);
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team metrics' });
    }
});

// Quality Assurance Routes
router.get('/metrics/quality', async (req, res) => {
    try {
        const { startTime, endTime } = req.query;
        const result = await req.supervisorService.getQualityMetrics(startTime, endTime);
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quality metrics' });
    }
});

// Alert Management Routes
router.get('/alerts', async (req, res) => {
    try {
        const filters = {
            type: req.query.type,
            acknowledged: req.query.acknowledged === 'true',
            priority: req.query.priority
        };
        
        const alerts = await req.supervisorService.getAlerts(filters);
        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Unable to fetch alerts' 
        });
    }
});

router.post('/alerts/:id/acknowledge', async (req, res) => {
    try {
        const alert = await req.supervisorService.acknowledgeAlert(req.params.id, req.user.id);
        res.json({ success: true, data: alert });
    } catch (error) {
        console.error('Error acknowledging alert:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Unable to acknowledge alert' 
        });
    }
});

// Settings Routes
router.get('/settings', async (req, res) => {
    try {
        const result = await req.supervisorService.getSettings(req.user.id);
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.post('/settings', async (req, res) => {
    try {
        const result = await req.supervisorService.updateSettings(req.user.id, req.body);
        if (!result.success) {
            return res.status(500).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router; 