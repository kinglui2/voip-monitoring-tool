const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const ThreeCXService = require('../services/threeCXService');
const YeastarService = require('../services/yeastarService');

class ReportsWebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map to store client connections
        this.pbxServices = {
            '3cx': new ThreeCXService(),
            'yeastar': new YeastarService()
        };
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            // Extract token and PBX type from URL parameters
            const urlParams = new URLSearchParams(req.url.split('?')[1]);
            const token = urlParams.get('token');
            const pbxType = urlParams.get('pbx');

            if (!token || !pbxType) {
                ws.close(1008, 'Missing required parameters');
                return;
            }

            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Store client connection with its PBX type
                this.clients.set(ws, {
                    userId: decoded.userId,
                    pbxType: pbxType
                });

                // Send initial connection success message
                ws.send(JSON.stringify({
                    type: 'connection',
                    status: 'connected',
                    pbx: pbxType
                }));

                // Start real-time updates for this client
                this.startRealTimeUpdates(ws, pbxType);

                // Handle client disconnect
                ws.on('close', () => {
                    this.clients.delete(ws);
                });

                // Handle errors
                ws.on('error', (error) => {
                    console.error('WebSocket error:', error);
                    this.clients.delete(ws);
                });

            } catch (error) {
                console.error('Authentication error:', error);
                ws.close(1008, 'Invalid token');
            }
        });
    }

    startRealTimeUpdates(ws, pbxType) {
        const service = this.pbxServices[pbxType];
        if (!service) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid PBX type'
            }));
            return;
        }

        // Set up event listeners for real-time updates
        service.on('callLog', (log) => {
            if (this.clients.get(ws).pbxType === pbxType) {
                ws.send(JSON.stringify({
                    type: 'callLog',
                    log: log
                }));
            }
        });

        service.on('systemLog', (log) => {
            if (this.clients.get(ws).pbxType === pbxType) {
                ws.send(JSON.stringify({
                    type: 'systemLog',
                    log: log
                }));
            }
        });

        service.on('metrics', (metrics) => {
            if (this.clients.get(ws).pbxType === pbxType) {
                ws.send(JSON.stringify({
                    type: 'metrics',
                    metrics: metrics
                }));
            }
        });

        // Start polling for updates
        this.startPolling(ws, service);
    }

    startPolling(ws, service) {
        // Poll for updates every 5 seconds
        const pollInterval = setInterval(async () => {
            try {
                // Only send updates if the connection is still open
                if (ws.readyState === WebSocket.OPEN) {
                    const metrics = await service.getMetrics();
                    ws.send(JSON.stringify({
                        type: 'metrics',
                        metrics: metrics
                    }));
                } else {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Polling error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to fetch metrics'
                }));
            }
        }, 5000);

        // Clean up interval when connection closes
        ws.on('close', () => {
            clearInterval(pollInterval);
        });
    }

    // Method to broadcast updates to all connected clients
    broadcast(type, data, pbxType) {
        this.clients.forEach((client, ws) => {
            if (client.pbxType === pbxType && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: type,
                    ...data
                }));
            }
        });
    }
}

module.exports = ReportsWebSocketServer; 