import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/supervisor';

class SupervisorService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    // Team Management
    async getTeamStatus() {
        try {
            const response = await this.axiosInstance.get('/team/status');
            return response.data;
        } catch (error) {
            console.error('Error fetching team status:', error);
            throw error;
        }
    }

    // Call Monitoring
    async getActiveCalls() {
        try {
            const response = await this.axiosInstance.get('/calls/active');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching active calls:', error);
            return {
                success: false,
                error: error.response?.data?.message || 
                       error.response?.status === 503 ? 'No active PBX configuration' :
                       'Unable to connect to the monitoring system'
            };
        }
    }

    // Performance Analytics
    async getTeamMetrics(startTime, endTime) {
        try {
            const response = await this.axiosInstance.get('/metrics/team', {
                params: { startTime, endTime }
            });
            return {
                success: true,
                data: {
                    ...response.data,
                    // Calculate percentage changes
                    callsChange: response.data.callsChange || 0,
                    durationChange: response.data.durationChange || 0,
                    waitTimeChange: response.data.waitTimeChange || 0,
                    // Format durations
                    avgCallDuration: this.formatDuration(response.data.avgCallDuration),
                    avgWaitTime: this.formatDuration(response.data.avgWaitTime),
                    // Format agent metrics
                    agentMetrics: response.data.agentMetrics?.map(agent => ({
                        ...agent,
                        avgDuration: this.formatDuration(agent.avgDuration)
                    })) || []
                }
            };
        } catch (error) {
            console.error('Error fetching team metrics:', error);
            throw error;
        }
    }

    // Helper method to format duration
    formatDuration(seconds) {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Quality Assurance
    async getQualityMetrics(startTime, endTime) {
        try {
            const response = await this.axiosInstance.get('/metrics/quality', {
                params: { startTime, endTime }
            });
            return {
                success: true,
                data: {
                    ...response.data,
                    calls: response.data.calls?.map(call => ({
                        ...call,
                        date: new Date(call.date),
                        duration: this.formatDuration(call.duration)
                    })) || []
                }
            };
        } catch (error) {
            console.error('Error fetching quality metrics:', error);
            throw error;
        }
    }

    async submitEvaluation(callId, evaluation) {
        try {
            const response = await this.axiosInstance.post(`/calls/${callId}/evaluate`, evaluation);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            throw error;
        }
    }

    async getCallRecording(callId) {
        try {
            const response = await this.axiosInstance.get(`/calls/${callId}/recording`, {
                responseType: 'blob'
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching call recording:', error);
            throw error;
        }
    }

    // Alert Management
    async getAlerts() {
        try {
            const response = await this.axiosInstance.get('/alerts');
            return {
                success: true,
                data: {
                    alerts: response.data.alerts || []
                }
            };
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Unable to fetch alerts'
            };
        }
    }

    async acknowledgeAlert(alertId) {
        try {
            const response = await this.axiosInstance.post(`/alerts/${alertId}/acknowledge`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error acknowledging alert:', error);
            throw error;
        }
    }

    // WebSocket Event Handlers
    setupWebSocketHandlers(socket) {
        if (!socket) {
            console.error('No socket instance provided');
            return;
        }

        socket.on('supervisor:callUpdate', (data) => {
            // Handle call updates
            console.log('Call update received:', data);
        });

        socket.on('supervisor:systemUpdate', (data) => {
            // Handle system updates
            console.log('System update received:', data);
        });

        socket.on('supervisor:metricsUpdate', (data) => {
            // Handle metrics updates
            console.log('Metrics update received:', data);
        });

        socket.on('supervisor:alert', (data) => {
            // Handle new alerts
            console.log('New alert received:', data);
            // Emit event for components to handle
            this.emit('newAlert', data);
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        return socket;
    }
}

export default new SupervisorService(); 