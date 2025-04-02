import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaPhone, FaClock, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './BillingSummary.css';

const BillingSummary = ({ pbxType, filters }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSummary();
    }, [pbxType, filters]);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/billing/summary?pbxType=${pbxType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters)
            });

            if (!response.ok) {
                throw new Error('Failed to fetch billing summary');
            }

            const data = await response.json();
            setSummary(data);
        } catch (err) {
            setError('Failed to load billing summary. Please try again.');
            console.error('Error fetching billing summary:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const calculateTrend = (current, previous) => {
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    };

    const getTrendIndicator = (trend) => {
        if (trend > 5) return { icon: <FaChartLine className="trend-up" />, text: 'Significant Increase' };
        if (trend > 0) return { icon: <FaChartLine className="trend-up" />, text: 'Slight Increase' };
        if (trend < -5) return { icon: <FaChartLine className="trend-down" />, text: 'Significant Decrease' };
        if (trend < 0) return { icon: <FaChartLine className="trend-down" />, text: 'Slight Decrease' };
        return { icon: <FaChartLine className="trend-neutral" />, text: 'No Change' };
    };

    if (loading) return <LoadingSpinner message="Loading billing summary..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchSummary} />;
    if (!summary) return null;

    return (
        <div className="billing-summary">
            <div className="summary-header">
                <h2>Billing Summary</h2>
                <div className="summary-period">
                    {new Date(filters.dateRange.start).toLocaleDateString()} - {new Date(filters.dateRange.end).toLocaleDateString()}
                </div>
            </div>

            <div className="summary-grid">
                <div className="summary-card total-cost">
                    <div className="card-header">
                        <FaDollarSign className="card-icon" />
                        <h3>Total Cost</h3>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{formatCurrency(summary.totalCost)}</div>
                        <div className="card-trend">
                            {getTrendIndicator(calculateTrend(summary.totalCost, summary.previousTotalCost)).icon}
                            <span>{getTrendIndicator(calculateTrend(summary.totalCost, summary.previousTotalCost)).text}</span>
                        </div>
                    </div>
                </div>

                <div className="summary-card total-calls">
                    <div className="card-header">
                        <FaPhone className="card-icon" />
                        <h3>Total Calls</h3>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{summary.totalCalls}</div>
                        <div className="card-trend">
                            {getTrendIndicator(calculateTrend(summary.totalCalls, summary.previousTotalCalls)).icon}
                            <span>{getTrendIndicator(calculateTrend(summary.totalCalls, summary.previousTotalCalls)).text}</span>
                        </div>
                    </div>
                </div>

                <div className="summary-card avg-duration">
                    <div className="card-header">
                        <FaClock className="card-icon" />
                        <h3>Average Duration</h3>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{formatDuration(summary.averageDuration)}</div>
                        <div className="card-trend">
                            {getTrendIndicator(calculateTrend(summary.averageDuration, summary.previousAverageDuration)).icon}
                            <span>{getTrendIndicator(calculateTrend(summary.averageDuration, summary.previousAverageDuration)).text}</span>
                        </div>
                    </div>
                </div>

                <div className="summary-card cost-per-call">
                    <div className="card-header">
                        <FaDollarSign className="card-icon" />
                        <h3>Cost per Call</h3>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{formatCurrency(summary.costPerCall)}</div>
                        <div className="card-trend">
                            {getTrendIndicator(calculateTrend(summary.costPerCall, summary.previousCostPerCall)).icon}
                            <span>{getTrendIndicator(calculateTrend(summary.costPerCall, summary.previousCostPerCall)).text}</span>
                        </div>
                    </div>
                </div>
            </div>

            {summary.alerts && summary.alerts.length > 0 && (
                <div className="summary-alerts">
                    <h3><FaExclamationTriangle className="alert-icon" /> Important Alerts</h3>
                    <ul>
                        {summary.alerts.map((alert, index) => (
                            <li key={index} className={`alert-item ${alert.severity}`}>
                                {alert.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BillingSummary; 