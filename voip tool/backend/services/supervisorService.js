const EventEmitter = require('events');
const logger = require('../logger');
const { PBXError } = require('../utils/PBXError');
const Alert = require('../models/Alert');
const User = require('../models/User');

class SupervisorService extends EventEmitter {
    constructor(pbxService) {
        super();
        this.pbxService = pbxService;
        this.connected = false;
        this.lastSync = null;
    }

    async initialize() {
        try {
            // Listen to PBX events
            this.setupEventListeners();
            this.connected = true;
            this.lastSync = new Date();
            return { success: true, message: 'Supervisor service initialized successfully' };
        } catch (error) {
            this.connected = false;
            throw new PBXError('Failed to initialize supervisor service', error);
        }
    }

    setupEventListeners() {
        // Call monitoring events
        this.pbxService.on('callLog', (call) => {
            this.processCallEvent(call);
        });

        // System events
        this.pbxService.on('systemLog', (log) => {
            this.processSystemEvent(log);
        });

        // Metrics events
        this.pbxService.on('metrics', (metrics) => {
            this.processMetrics(metrics);
        });

        // Error handling
        this.pbxService.on('error', (error) => {
            this.emit('error', error);
        });
    }

    // Team Management
    async getTeamStatus() {
        try {
            const extensions = await this.pbxService.getExtensions();
            const queueStatus = await this.pbxService.getQueueStatus();
            
            return {
                success: true,
                data: {
                    extensions,
                    queueStatus,
                    lastUpdated: new Date()
                }
            };
        } catch (error) {
            logger.error('Error fetching team status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Call Monitoring
    async getActiveCalls() {
        try {
            const callLogs = await this.pbxService.getCallLogs();
            const activeCalls = callLogs.filter(call => call.status === 'active');
            
            return {
                success: true,
                data: {
                    activeCalls,
                    totalActive: activeCalls.length,
                    lastUpdated: new Date()
                }
            };
        } catch (error) {
            logger.error('Error fetching active calls:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Performance Analytics
    async getTeamMetrics(startTime, endTime) {
        try {
            const metrics = await this.pbxService.getMetrics(startTime, endTime);
            const processedMetrics = this.processTeamMetrics(metrics);
            
            return {
                success: true,
                data: {
                    metrics: processedMetrics,
                    period: { startTime, endTime },
                    lastUpdated: new Date()
                }
            };
        } catch (error) {
            logger.error('Error fetching team metrics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Quality Assurance
    async getQualityMetrics(startTime, endTime) {
        try {
            const recordings = await this.pbxService.getRecordings(startTime, endTime);
            const processedMetrics = this.processQualityMetrics(recordings);
            
            return {
                success: true,
                data: {
                    qualityMetrics: processedMetrics,
                    period: { startTime, endTime },
                    lastUpdated: new Date()
                }
            };
        } catch (error) {
            logger.error('Error fetching quality metrics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Alert Management
    async getAlerts(filters = {}) {
        try {
            const query = {};
            
            if (filters.type) {
                query.type = filters.type;
            }
            if (filters.acknowledged !== undefined) {
                query.acknowledged = filters.acknowledged;
            }
            if (filters.priority) {
                query.priority = filters.priority;
            }
            
            const alerts = await Alert.find(query)
                .sort({ createdAt: -1 })
                .limit(100);
                
            return alerts;
        } catch (error) {
            logger.error('Error fetching alerts:', error);
            throw error;
        }
    }

    async acknowledgeAlert(alertId, userId) {
        try {
            const alert = await Alert.findById(alertId);
            if (!alert) {
                throw new Error('Alert not found');
            }

            alert.acknowledged = true;
            alert.acknowledgedBy = userId;
            alert.acknowledgedAt = new Date();
            
            await alert.save();
            
            // Emit event for real-time updates
            this.emit('alertAcknowledged', alert);
            
            return alert;
        } catch (error) {
            logger.error('Error acknowledging alert:', error);
            throw error;
        }
    }

    async createSystemAlert(title, message, priority = 'medium', metadata = {}) {
        try {
            const alert = new Alert({
                type: 'system',
                title,
                message,
                priority,
                metadata
            });
            
            await alert.save();
            
            // Emit event for real-time updates
            this.emit('newAlert', alert);
            
            return alert;
        } catch (error) {
            logger.error('Error creating system alert:', error);
            throw error;
        }
    }

    async createPerformanceAlert(title, message, agentId, agentName, priority = 'medium', metadata = {}) {
        try {
            const alert = new Alert({
                type: 'performance',
                title,
                message,
                agentId,
                agentName,
                priority,
                metadata
            });
            
            await alert.save();
            
            // Emit event for real-time updates
            this.emit('newAlert', alert);
            
            return alert;
        } catch (error) {
            logger.error('Error creating performance alert:', error);
            throw error;
        }
    }

    // Helper Methods
    processCallEvent(call) {
        // Process call event and emit supervisor-specific events
        this.emit('supervisor:callUpdate', {
            callId: call.id,
            status: call.status,
            extension: call.extension,
            timestamp: new Date()
        });
    }

    processSystemEvent(log) {
        // Process system event and emit supervisor-specific events
        this.emit('supervisor:systemUpdate', {
            type: log.type,
            message: log.message,
            timestamp: new Date()
        });
    }

    processMetrics(metrics) {
        // Process metrics and emit supervisor-specific events
        this.emit('supervisor:metricsUpdate', {
            metrics: this.processTeamMetrics(metrics),
            timestamp: new Date()
        });
    }

    processTeamMetrics(metrics) {
        // Process and aggregate team metrics
        return {
            totalCalls: metrics.totalCalls || 0,
            averageDuration: metrics.averageDuration || 0,
            answeredCalls: metrics.answeredCalls || 0,
            missedCalls: metrics.missedCalls || 0,
            averageWaitTime: metrics.averageWaitTime || 0
        };
    }

    processQualityMetrics(recordings) {
        // Process and calculate quality metrics
        return {
            totalRecordings: recordings.length,
            averageScore: this.calculateAverageScore(recordings),
            distribution: this.calculateScoreDistribution(recordings)
        };
    }

    calculateAverageScore(recordings) {
        if (!recordings.length) return 0;
        const total = recordings.reduce((sum, rec) => sum + (rec.score || 0), 0);
        return total / recordings.length;
    }

    calculateScoreDistribution(recordings) {
        const distribution = {
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0
        };

        recordings.forEach(rec => {
            const score = rec.score || 0;
            if (score >= 90) distribution.excellent++;
            else if (score >= 70) distribution.good++;
            else if (score >= 50) distribution.fair++;
            else distribution.poor++;
        });

        return distribution;
    }

    // Settings Management
    async getSettings(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Return default settings if none exist
            if (!user.settings) {
                return {
                    success: true,
                    data: {
                        notifications: {
                            systemAlerts: true,
                            performanceAlerts: true,
                            emailNotifications: false,
                            soundNotifications: true,
                            desktopNotifications: true
                        },
                        dashboard: {
                            layout: 'default',
                            showCallMonitoring: true,
                            showTeamStatus: true,
                            showPerformanceMetrics: true,
                            showAlerts: true
                        },
                        monitoring: {
                            callDurationThreshold: 300,
                            queueWaitTimeThreshold: 180,
                            agentIdleTimeThreshold: 300,
                            performanceThreshold: 80
                        }
                    }
                };
            }

            return {
                success: true,
                data: user.settings
            };
        } catch (error) {
            logger.error('Error fetching settings:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateSettings(userId, settings) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.settings = settings;
            await user.save();

            // Emit event for real-time updates
            this.emit('settingsUpdated', { userId, settings });

            return {
                success: true,
                data: settings
            };
        } catch (error) {
            logger.error('Error updating settings:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = SupervisorService; 