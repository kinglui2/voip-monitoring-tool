import api from './api';

// Mock data for system operations
const mockMetrics = {
    cpu: { usage: 45, status: 'normal' },
    memory: { usage: 60, status: 'normal' },
    disk: { usage: 75, status: 'warning' },
    network: { status: 'active', speed: '1000 Mbps' }
};

const mockServices = [
    { name: 'VoIP Service', status: 'running', uptime: '7d 12h' },
    { name: 'Database', status: 'running', uptime: '7d 12h' },
    { name: 'Web Server', status: 'running', uptime: '7d 12h' },
    { name: 'Backup Service', status: 'running', uptime: '7d 12h' }
];

const mockLogs = [
    { id: 1, timestamp: new Date().toISOString(), level: 'INFO', message: 'System check completed successfully' },
    { id: 2, timestamp: new Date(Date.now() - 300000).toISOString(), level: 'WARNING', message: 'High memory usage detected' },
    { id: 3, timestamp: new Date(Date.now() - 600000).toISOString(), level: 'INFO', message: 'Backup process started' }
];

// Get system metrics for the selected PBX
export const getSystemMetrics = async (pbxType) => {
    try {
        const response = await api.get(`/api/pbx/${pbxType}/metrics`);
        const metrics = response.data;
        
        // Determine status based on thresholds
        const getStatus = (usage) => {
            if (usage >= 90) return 'error';
            if (usage >= 75) return 'warning';
            return 'normal';
        };

        return {
            cpu: {
                usage: metrics.cpu_usage || 0,
                status: getStatus(metrics.cpu_usage || 0)
            },
            memory: {
                usage: metrics.memory_usage || 0,
                status: getStatus(metrics.memory_usage || 0)
            },
            disk: {
                usage: metrics.disk_usage || 0,
                status: getStatus(metrics.disk_usage || 0)
            },
            network: {
                status: metrics.network_status || 'error',
                speed: metrics.network_speed ? `${metrics.network_speed} Mbps` : 'Unknown'
            }
        };
    } catch (error) {
        console.error('Error fetching system metrics:', error);
        throw error;
    }
};

// Get services status for the selected PBX
export const getServicesStatus = async (pbxType) => {
    try {
        const response = await api.get(`/api/pbx/${pbxType}/status`);
        const status = response.data;
        
        return [
            {
                name: pbxType === '3cx' ? '3CX VoIP Service' : 'Yeastar VoIP Service',
                status: status.voip_status || 'error',
                uptime: status.voip_uptime || '0d 0h'
            },
            {
                name: 'Database Service',
                status: status.database_status || 'error',
                uptime: status.database_uptime || '0d 0h'
            },
            {
                name: 'Web Server',
                status: status.web_status || 'error',
                uptime: status.web_uptime || '0d 0h'
            }
        ];
    } catch (error) {
        console.error('Error fetching services status:', error);
        throw error;
    }
};

// Get system logs for the selected PBX
export const getSystemLogs = async (pbxType) => {
    try {
        const response = await api.get(`/api/pbx/${pbxType}/logs`);
        return response.data.slice(0, 100); // Return last 100 logs
    } catch (error) {
        console.error('Error fetching system logs:', error);
        throw error;
    }
};

// Perform maintenance actions on the selected PBX
export const performMaintenance = async (pbxType, action) => {
    try {
        const response = await api.post(`/api/pbx/${pbxType}/maintenance`, { action });
        return response.data;
    } catch (error) {
        console.error('Error performing maintenance action:', error);
        throw error;
    }
}; 