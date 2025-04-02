const { validateDateRange } = require('./validators');
const { formatDuration } = require('./formatters');

/**
 * Calculates call usage statistics for a given period
 * @param {string} pbxType - The type of PBX system
 * @param {Date|number|string} startDate - Start date of the period
 * @param {Date|number|string} endDate - End date of the period
 * @param {string[]} [extensions] - Optional list of extensions to filter by
 * @returns {Promise<Object>} The usage statistics
 */
exports.calculateUsage = async (pbxType, startDate, endDate, extensions = []) => {
    validateDateRange({ start: startDate, end: endDate });

    try {
        // Fetch call records from the database
        const calls = await fetchCallRecords(pbxType, startDate, endDate, extensions);

        // Calculate basic metrics
        const totalCalls = calls.length;
        const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
        const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

        // Calculate costs
        const costs = calculateCosts(calls);

        // Group calls by type
        const callsByType = groupCallsByType(calls);

        // Calculate quality metrics
        const qualityMetrics = calculateQualityMetrics(calls);

        return {
            summary: {
                totalCalls,
                totalDuration: formatDuration(totalDuration),
                averageDuration: formatDuration(averageDuration),
                totalCost: costs.total,
                currency: 'USD'
            },
            callTypes: callsByType,
            costs: costs.breakdown,
            quality: qualityMetrics,
            timeDistribution: calculateTimeDistribution(calls),
            extensionUsage: calculateExtensionUsage(calls)
        };
    } catch (error) {
        console.error('Error calculating usage:', error);
        throw new Error('Failed to calculate usage statistics');
    }
};

/**
 * Fetches call records from the database
 * @private
 */
async function fetchCallRecords(pbxType, startDate, endDate, extensions) {
    // This would be implemented to fetch actual call records from your database
    // For now, returning a mock implementation
    return [];
}

/**
 * Calculates costs for calls
 * @private
 */
function calculateCosts(calls) {
    const breakdown = {
        local: 0,
        longDistance: 0,
        international: 0,
        tollfree: 0
    };

    // Calculate costs based on call types and durations
    calls.forEach(call => {
        const cost = calculateCallCost(call);
        breakdown[call.type] = (breakdown[call.type] || 0) + cost;
    });

    return {
        total: Object.values(breakdown).reduce((sum, cost) => sum + cost, 0),
        breakdown
    };
}

/**
 * Calculates cost for a single call
 * @private
 */
function calculateCallCost(call) {
    // This would be implemented with actual cost calculation logic
    // based on your pricing model
    return 0;
}

/**
 * Groups calls by type
 * @private
 */
function groupCallsByType(calls) {
    const types = {
        inbound: [],
        outbound: [],
        internal: [],
        missed: [],
        failed: []
    };

    calls.forEach(call => {
        if (types[call.type]) {
            types[call.type].push(call);
        }
    });

    return Object.entries(types).reduce((acc, [type, calls]) => {
        acc[type] = {
            count: calls.length,
            duration: formatDuration(calls.reduce((sum, call) => sum + call.duration, 0))
        };
        return acc;
    }, {});
}

/**
 * Calculates quality metrics for calls
 * @private
 */
function calculateQualityMetrics(calls) {
    const metrics = {
        mos: 0,
        jitter: 0,
        latency: 0,
        packetLoss: 0
    };

    if (calls.length === 0) return metrics;

    calls.forEach(call => {
        metrics.mos += call.mos || 0;
        metrics.jitter += call.jitter || 0;
        metrics.latency += call.latency || 0;
        metrics.packetLoss += call.packetLoss || 0;
    });

    // Calculate averages
    Object.keys(metrics).forEach(key => {
        metrics[key] = metrics[key] / calls.length;
    });

    return metrics;
}

/**
 * Calculates call distribution across different times
 * @private
 */
function calculateTimeDistribution(calls) {
    const distribution = {
        hourly: new Array(24).fill(0),
        daily: new Array(7).fill(0),
        monthly: new Array(12).fill(0)
    };

    calls.forEach(call => {
        const date = new Date(call.startTime);
        distribution.hourly[date.getHours()]++;
        distribution.daily[date.getDay()]++;
        distribution.monthly[date.getMonth()]++;
    });

    return distribution;
}

/**
 * Calculates usage statistics per extension
 * @private
 */
function calculateExtensionUsage(calls) {
    const usage = {};

    calls.forEach(call => {
        const extension = call.extension;
        if (!usage[extension]) {
            usage[extension] = {
                totalCalls: 0,
                totalDuration: 0,
                inbound: 0,
                outbound: 0,
                missed: 0
            };
        }

        usage[extension].totalCalls++;
        usage[extension].totalDuration += call.duration;
        usage[extension][call.type]++;
    });

    // Format durations
    Object.values(usage).forEach(stats => {
        stats.totalDuration = formatDuration(stats.totalDuration);
    });

    return usage;
} 