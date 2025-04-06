import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaDownload, FaFilter, FaSync, FaChartBar, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FilterModal from './FilterModal';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './Billing.css';

const Billing = () => {
    const [pbxType, setPbxType] = useState('3cx');
    const [timeRange, setTimeRange] = useState('current'); // current, lastMonth, custom
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [billingData, setBillingData] = useState({
        currentMonth: {
            totalCalls: 0,
            totalDuration: 0,
            totalCost: 0,
            callsByType: [],
            costByTrunk: []
        },
        usageStats: {
            dailyUsage: [],
            peakHours: [],
            topExtensions: []
        },
        invoices: []
    });
    const [filters, setFilters] = useState({
        dateRange: {
            start: new Date().setMonth(new Date().getMonth() - 1),
            end: new Date()
        },
        callTypes: ['all'],
        extensions: ['all'],
        minCost: 0,
        maxCost: Infinity
    });

    // Fetch billing data
    useEffect(() => {
        fetchBillingData();
    }, [pbxType, timeRange, filters]);

    const fetchBillingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:5000/api/billing/${pbxType}?timeRange=${timeRange}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(filters)
                }
            );
            if (!response.ok) throw new Error('Failed to fetch billing data');
            const data = await response.json();
            setBillingData(data);
        } catch (err) {
            console.error('Error fetching billing data:', err);
            if (err.message.includes('Failed to fetch')) {
                setError(err.message);
            } else {
                toast.error('Error loading billing data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExportInvoice = async (invoiceId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/billing/${pbxType}/invoice/${invoiceId}/export`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to export invoice');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Invoice exported successfully');
        } catch (err) {
            console.error('Error exporting invoice:', err);
            toast.error('Failed to export invoice');
        }
    };

    const handleGenerateInvoice = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/billing/${pbxType}/invoice/generate`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(filters)
                }
            );
            if (!response.ok) throw new Error('Failed to generate invoice');
            const data = await response.json();
            setBillingData(prev => ({
                ...prev,
                invoices: [...prev.invoices, data]
            }));
            toast.success('Invoice generated successfully');
        } catch (err) {
            console.error('Error generating invoice:', err);
            toast.error('Failed to generate invoice');
        }
    };

    const handleFilterApply = (newFilters) => {
        setFilters(newFilters);
        setShowFilterModal(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const getCostTrend = (current, previous) => {
        if (!previous) return null;
        const difference = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(difference).toFixed(1),
            direction: difference >= 0 ? 'up' : 'down',
            color: difference >= 0 ? '#dc3545' : '#28a745'
        };
    };

    return (
        <div className="billing">
            {loading && <LoadingSpinner />}
            
            {error && error.includes('Failed to fetch billing data') && (
                <ErrorMessage 
                    type="full"
                    title="Billing Data Error"
                    message="Unable to load billing information"
                    suggestion="Please check your connection and try again"
                    onRetry={fetchBillingData}
                />
            )}
            
            {error && !error.includes('Failed to fetch billing data') && (
                <ErrorMessage 
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="billing-header">
                <h2>Billing Management</h2>
                <div className="header-controls">
                    <div className="pbx-selector">
                        <button 
                            className={`pbx-btn ${pbxType === '3cx' ? 'active' : ''}`}
                            onClick={() => setPbxType('3cx')}
                        >
                            3CX
                        </button>
                        <button 
                            className={`pbx-btn ${pbxType === 'yeastar' ? 'active' : ''}`}
                            onClick={() => setPbxType('yeastar')}
                        >
                            Yeastar
                        </button>
                    </div>
                    <div className="time-range-selector">
                        <button 
                            className={`time-btn ${timeRange === 'current' ? 'active' : ''}`}
                            onClick={() => setTimeRange('current')}
                        >
                            Current Month
                        </button>
                        <button 
                            className={`time-btn ${timeRange === 'lastMonth' ? 'active' : ''}`}
                            onClick={() => setTimeRange('lastMonth')}
                        >
                            Last Month
                        </button>
                        <button 
                            className={`time-btn ${timeRange === 'custom' ? 'active' : ''}`}
                            onClick={() => setTimeRange('custom')}
                        >
                            Custom Range
                        </button>
                    </div>
                    <div className="action-buttons">
                        <button className="action-btn" onClick={handleGenerateInvoice}>
                            <FaFileInvoiceDollar className="action-icon" />
                            Generate Invoice
                        </button>
                        <button className="action-btn" onClick={() => setShowFilterModal(true)}>
                            <FaFilter className="action-icon" />
                            Filters
                        </button>
                        <button className="action-btn" onClick={fetchBillingData}>
                            <FaSync className="action-icon" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="billing-grid">
                <div className="billing-card">
                    <div className="card-header">
                        <FaFileInvoiceDollar className="card-icon" />
                        <h3>Current Month Summary</h3>
                    </div>
                    <div className="card-content">
                        <div className="summary-metrics">
                            <div className="metric">
                                <span className="label">Total Calls</span>
                                <span className="value">{billingData.currentMonth.totalCalls}</span>
                                {billingData.previousMonth && (
                                    <span className="trend" style={{ color: getCostTrend(billingData.currentMonth.totalCalls, billingData.previousMonth.totalCalls)?.color }}>
                                        {getCostTrend(billingData.currentMonth.totalCalls, billingData.previousMonth.totalCalls)?.direction === 'up' ? '↑' : '↓'}
                                        {getCostTrend(billingData.currentMonth.totalCalls, billingData.previousMonth.totalCalls)?.value}%
                                    </span>
                                )}
                            </div>
                            <div className="metric">
                                <span className="label">Total Duration</span>
                                <span className="value">{formatDuration(billingData.currentMonth.totalDuration)}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Total Cost</span>
                                <span className="value">{formatCurrency(billingData.currentMonth.totalCost)}</span>
                                {billingData.previousMonth && (
                                    <span className="trend" style={{ color: getCostTrend(billingData.currentMonth.totalCost, billingData.previousMonth.totalCost)?.color }}>
                                        {getCostTrend(billingData.currentMonth.totalCost, billingData.previousMonth.totalCost)?.direction === 'up' ? '↑' : '↓'}
                                        {getCostTrend(billingData.currentMonth.totalCost, billingData.previousMonth.totalCost)?.value}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="cost-breakdown">
                            <h4>Cost by Trunk</h4>
                            {billingData.currentMonth.costByTrunk.map((trunk, index) => (
                                <div key={index} className="trunk-cost">
                                    <span className="trunk-name">{trunk.name}</span>
                                    <span className="trunk-amount">{formatCurrency(trunk.cost)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="billing-card">
                    <div className="card-header">
                        <FaChartBar className="card-icon" />
                        <h3>Usage Statistics</h3>
                    </div>
                    <div className="card-content">
                        <div className="usage-stats">
                            <div className="stat-section">
                                <h4>Peak Hours</h4>
                                {billingData.usageStats.peakHours.map((hour, index) => (
                                    <div key={index} className="peak-hour">
                                        <span className="hour">{hour.time}</span>
                                        <span className="calls">{hour.calls} calls</span>
                                    </div>
                                ))}
                            </div>
                            <div className="stat-section">
                                <h4>Top Extensions</h4>
                                {billingData.usageStats.topExtensions.map((ext, index) => (
                                    <div key={index} className="top-extension">
                                        <span className="extension">{ext.number}</span>
                                        <span className="cost">{formatCurrency(ext.cost)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="billing-card full-width">
                    <div className="card-header">
                        <FaCalendarAlt className="card-icon" />
                        <h3>Invoices</h3>
                    </div>
                    <div className="card-content">
                        <div className="invoices-list">
                            {billingData.invoices.map((invoice) => (
                                <div key={invoice.id} className="invoice-item">
                                    <div className="invoice-info">
                                        <span className="invoice-id">Invoice #{invoice.id}</span>
                                        <span className="invoice-date">{new Date(invoice.date).toLocaleDateString()}</span>
                                        <span className="invoice-amount">{formatCurrency(invoice.amount)}</span>
                                        <span className={`invoice-status ${invoice.status}`}>{invoice.status}</span>
                                    </div>
                                    <div className="invoice-actions">
                                        <button 
                                            className="action-btn"
                                            onClick={() => handleExportInvoice(invoice.id)}
                                        >
                                            <FaDownload className="action-icon" />
                                            Export
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <FilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                onApply={handleFilterApply}
                currentFilters={filters}
            />
        </div>
    );
};

export default Billing; 