import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCheckCircle, FaClock, FaExclamationCircle, FaFilter, FaDownload } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './PaymentTracking.css';

const PaymentTracking = ({ pbxType, filters }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentStats, setPaymentStats] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [paymentFilters, setPaymentFilters] = useState({
        status: 'all',
        dateRange: {
            start: new Date().setMonth(new Date().getMonth() - 3),
            end: new Date()
        },
        minAmount: '',
        maxAmount: ''
    });

    useEffect(() => {
        fetchPayments();
        fetchPaymentStats();
    }, [pbxType, paymentFilters]);

    const fetchPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({
                status: paymentFilters.status,
                startDate: paymentFilters.dateRange.start,
                endDate: paymentFilters.dateRange.end,
                minAmount: paymentFilters.minAmount,
                maxAmount: paymentFilters.maxAmount
            });

            const response = await fetch(`/api/billing/payments/${pbxType}?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch payments');
            }

            const data = await response.json();
            setPayments(data);
        } catch (err) {
            setError('Failed to load payments. Please try again.');
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentStats = async () => {
        try {
            const response = await fetch(`/api/billing/payments/${pbxType}/stats`);
            if (!response.ok) {
                throw new Error('Failed to fetch payment statistics');
            }
            const data = await response.json();
            setPaymentStats(data);
        } catch (err) {
            console.error('Error fetching payment statistics:', err);
        }
    };

    const handleFilterChange = (field, value) => {
        setPaymentFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const exportPayments = async () => {
        try {
            const response = await fetch(`/api/billing/payments/${pbxType}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentFilters)
            });

            if (!response.ok) {
                throw new Error('Failed to export payments');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to export payments. Please try again.');
            console.error('Error exporting payments:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <FaCheckCircle className="status-icon paid" />;
            case 'pending':
                return <FaClock className="status-icon pending" />;
            case 'failed':
                return <FaExclamationCircle className="status-icon failed" />;
            default:
                return null;
        }
    };

    if (loading) return <LoadingSpinner message="Loading payments..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchPayments} />;

    return (
        <div className="payment-tracking">
            <div className="payment-header">
                <h2><FaMoneyBillWave /> Payment Tracking</h2>
                <div className="header-actions">
                    <button 
                        className="filter-btn"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> Filters
                    </button>
                    <button 
                        className="export-btn"
                        onClick={exportPayments}
                    >
                        <FaDownload /> Export
                    </button>
                </div>
            </div>

            {paymentStats && (
                <div className="payment-stats">
                    <div className="stat-card">
                        <div className="stat-label">Total Payments</div>
                        <div className="stat-value">{paymentStats.totalPayments}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Amount</div>
                        <div className="stat-value">{formatCurrency(paymentStats.totalAmount)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending Payments</div>
                        <div className="stat-value">{paymentStats.pendingPayments}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Failed Payments</div>
                        <div className="stat-value">{paymentStats.failedPayments}</div>
                    </div>
                </div>
            )}

            {showFilters && (
                <div className="payment-filters">
                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={paymentFilters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Date Range</label>
                        <div className="date-inputs">
                            <input
                                type="date"
                                value={new Date(paymentFilters.dateRange.start).toISOString().split('T')[0]}
                                onChange={(e) => handleFilterChange('dateRange', {
                                    ...paymentFilters.dateRange,
                                    start: new Date(e.target.value).getTime()
                                })}
                            />
                            <input
                                type="date"
                                value={new Date(paymentFilters.dateRange.end).toISOString().split('T')[0]}
                                onChange={(e) => handleFilterChange('dateRange', {
                                    ...paymentFilters.dateRange,
                                    end: new Date(e.target.value).getTime()
                                })}
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Amount Range</label>
                        <div className="amount-inputs">
                            <input
                                type="number"
                                placeholder="Min Amount"
                                value={paymentFilters.minAmount}
                                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Max Amount"
                                value={paymentFilters.maxAmount}
                                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="payment-list">
                {payments.length === 0 ? (
                    <div className="no-payments">
                        <p>No payments found for the selected filters.</p>
                    </div>
                ) : (
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Invoice</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Method</th>
                                <th>Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.id}</td>
                                    <td>#{payment.invoiceNumber}</td>
                                    <td>{formatCurrency(payment.amount)}</td>
                                    <td>{formatDate(payment.date)}</td>
                                    <td>
                                        <span className={`status-badge ${payment.status}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>{payment.method}</td>
                                    <td>{payment.reference}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PaymentTracking; 