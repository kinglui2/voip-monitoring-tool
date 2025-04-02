const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    monitoring: {
        callThreshold: { type: Number, default: 100 },
        qualityThreshold: { type: Number, default: 0.8 },
        alertEnabled: { type: Boolean, default: true },
        alertEmail: { type: String, default: '' },
        alertInterval: { type: Number, default: 5 }
    },
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        sessionTimeout: { type: Number, default: 30 },
        maxLoginAttempts: { type: Number, default: 5 },
        ipWhitelist: [{ type: String }]
    },
    integrations: {
        '3cx': {
            enabled: { type: Boolean, default: false },
            serverUrl: { type: String, default: '' },
            apiKey: { type: String, default: '' },
            extension: { type: String, default: '' },
            port: { type: Number, default: 5000 },
            verifySSL: { type: Boolean, default: true },
            lastSync: { type: Date },
            status: { type: String, enum: ['active', 'inactive', 'error'], default: 'inactive' },
            errorMessage: { type: String, default: '' }
        },
        'yeastar': {
            enabled: { type: Boolean, default: false },
            serverUrl: { type: String, default: '' },
            apiKey: { type: String, default: '' },
            extension: { type: String, default: '' },
            port: { type: Number, default: 80 },
            verifySSL: { type: Boolean, default: true },
            lastSync: { type: Date },
            status: { type: String, enum: ['active', 'inactive', 'error'], default: 'inactive' },
            errorMessage: { type: String, default: '' }
        }
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Add indexes for better query performance
systemConfigSchema.index({ 'integrations.3cx.enabled': 1 });
systemConfigSchema.index({ 'integrations.yeastar.enabled': 1 });

// Add methods for updating specific sections
systemConfigSchema.methods.updateMonitoring = async function(monitoringConfig) {
    this.monitoring = { ...this.monitoring, ...monitoringConfig };
    this.lastUpdated = new Date();
    return await this.save();
};

systemConfigSchema.methods.updateSecurity = async function(securityConfig) {
    this.security = { ...this.security, ...securityConfig };
    this.lastUpdated = new Date();
    return await this.save();
};

systemConfigSchema.methods.updateIntegration = async function(pbxType, integrationConfig) {
    if (!['3cx', 'yeastar'].includes(pbxType)) {
        throw new Error('Invalid PBX type');
    }
    this.integrations[pbxType] = { ...this.integrations[pbxType], ...integrationConfig };
    this.lastUpdated = new Date();
    return await this.save();
};

// Static method to get or create the system configuration
systemConfigSchema.statics.getConfig = async function() {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig; 