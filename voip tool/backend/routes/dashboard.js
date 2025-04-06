const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Call = require('../models/Call');
const PBXConfig = require('../models/PBXConfig');
const authMiddleware = require('../middleware/authMiddleware');
const ThreeCXService = require('../services/threeCXService');
const YeastarService = require('../services/yeastarService');

// Initialize PBX services
const threeCXService = new ThreeCXService();
const yeastarService = new YeastarService();

// Role checking middleware
const checkAdminRole = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
};

// Get dashboard data
router.get('/', authMiddleware, checkAdminRole, async (req, res) => {
    try {
        console.log('Fetching dashboard data for user:', req.user);
        
        // Get total users
        const totalUsers = await User.countDocuments();
        console.log('Total users:', totalUsers);

        // Get active calls
        const activeCalls = await Call.countDocuments({ status: 'ongoing' });
        console.log('Active calls:', activeCalls);

        // Get active PBX configuration
        const activePBX = await PBXConfig.findOne({ isActive: true });
        let systemStatus = 'Offline';
        let pbxType = 'None';
        let pbxDetails = null;
        let pbxMetrics = null;

        if (activePBX) {
            pbxType = activePBX.type;
            try {
                let service;
                if (activePBX.type === '3cx') {
                    service = threeCXService;
                } else if (activePBX.type === 'yeastar') {
                    service = yeastarService;
                }

                // Get system status
                const status = await service.getSystemStatus();
                systemStatus = status.isConnected ? 'Online' : 'Offline';

                // Get detailed metrics
                const metrics = await service.getMetrics();
                
                // Get system logs
                const logs = await service.getSystemLogs();

                // Get active extensions
                const extensions = await service.getActiveExtensions();

                // Get queue status
                const queues = await service.getQueueStatus();

                pbxDetails = {
                    type: activePBX.type,
                    serverUrl: activePBX.config.serverUrl,
                    lastConnected: activePBX.lastConnected,
                    status: systemStatus,
                    uptime: metrics.uptime || 'N/A',
                    version: metrics.version || 'N/A',
                    cpuUsage: metrics.cpuUsage || 'N/A',
                    memoryUsage: metrics.memoryUsage || 'N/A',
                    diskUsage: metrics.diskUsage || 'N/A'
                };

                pbxMetrics = {
                    activeExtensions: extensions.length,
                    totalExtensions: metrics.totalExtensions || 0,
                    activeQueues: queues.filter(q => q.status === 'active').length,
                    totalQueues: queues.length,
                    recentCalls: metrics.recentCalls || [],
                    systemAlerts: logs.filter(log => log.level === 'error' || log.level === 'warning').slice(0, 5),
                    performance: {
                        cpu: metrics.cpuUsage || 'N/A',
                        memory: metrics.memoryUsage || 'N/A',
                        disk: metrics.diskUsage || 'N/A',
                        network: metrics.networkUsage || 'N/A'
                    }
                };

            } catch (error) {
                console.error(`Error getting ${activePBX.type} system status:`, error);
                systemStatus = 'Error';
                pbxDetails = {
                    type: activePBX.type,
                    serverUrl: activePBX.config.serverUrl,
                    lastConnected: activePBX.lastConnected,
                    status: 'Error',
                    error: error.message
                };
            }
        }

        res.json({
            totalUsers,
            activeCalls,
            systemStatus,
            pbxType,
            pbxDetails,
            pbxMetrics,
            lastChecked: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router; 