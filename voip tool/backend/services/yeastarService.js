const EventEmitter = require('events');
const axios = require('axios');
const logger = require('../logger');
const { PBXError, ERROR_CODES } = require('../utils/PBXError');

class YeastarService extends EventEmitter {
    constructor() {
        super();
        this.config = null;
        this.connected = false;
        this.lastSync = null;
        this.pollingInterval = null;
    }

    async connect(config) {
        try {
            this.config = config;
            // Test connection
            await this.testConnection();
            this.connected = true;
            this.lastSync = new Date();
            
            // Start polling for updates
            this.startPolling();
            
            return { success: true, message: 'Connected to Yeastar successfully' };
        } catch (error) {
            this.connected = false;
            throw new PBXError('Failed to connect to Yeastar', error);
        }
    }

    startPolling() {
        // Poll for updates every 30 seconds
        this.pollingInterval = setInterval(async () => {
            try {
                await this.fetchUpdates();
            } catch (error) {
                console.error('Polling error:', error);
                this.emit('error', error);
            }
        }, 30000);
    }

    async fetchUpdates() {
        try {
            // Fetch latest call logs
            const callLogs = await this.getCallLogs();
            if (callLogs && callLogs.length > 0) {
                this.emit('callLog', callLogs[0]); // Emit most recent call
            }

            // Fetch system logs
            const systemLogs = await this.getSystemLogs();
            if (systemLogs && systemLogs.length > 0) {
                this.emit('systemLog', systemLogs[0]); // Emit most recent log
            }

            // Fetch metrics
            const metrics = await this.getMetrics();
            this.emit('metrics', metrics);

            this.lastSync = new Date();
        } catch (error) {
            console.error('Error fetching updates:', error);
            this.emit('error', error);
        }
    }

    async testConnection() {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/status`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            throw new PBXError('Failed to connect to Yeastar', error);
        }
    }

    async getCallLogs(startTime, endTime) {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/calls`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                params: {
                    startTime,
                    endTime
                }
            });
            return response.data;
        } catch (error) {
            throw new PBXError('Failed to fetch call logs', error);
        }
    }

    async getSystemLogs(startTime, endTime) {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/system/logs`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                params: {
                    startTime,
                    endTime
                }
            });
            return response.data;
        } catch (error) {
            throw new PBXError('Failed to fetch system logs', error);
        }
    }

    async getMetrics(startTime, endTime) {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/metrics`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                params: {
                    startTime,
                    endTime
                }
            });
            return response.data;
        } catch (error) {
            throw new PBXError('Failed to fetch metrics', error);
        }
    }

    disconnect() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.connected = false;
        this.lastSync = null;
    }

    async getSystemStatus() {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/status`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching Yeastar system status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getExtensions() {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/extensions`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching Yeastar extensions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTrunks() {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/trunks`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching Yeastar trunks:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Yeastar-specific features
    async getQueueStatus() {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/queues/status`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching Yeastar queue status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDIDNumbers() {
        try {
            const response = await axios.get(`${this.config.serverUrl}/api/dids`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching Yeastar DID numbers:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = YeastarService; 