import React, { useState } from 'react';
import { FaDownload, FaFileCsv, FaFileExcel, FaFilePdf, FaCalendar, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './BillingExport.css';

const BillingExport = ({ pbxType }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exportOptions, setExportOptions] = useState({
        format: 'csv',
        dateRange: {
            start: new Date().setMonth(new Date().getMonth() - 3),
            end: new Date()
        },
        includeInvoices: true,
        includePayments: true,
        includeUsage: true,
        groupBy: 'month',
        customFields: []
    });

    const handleExport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/billing/export/${pbxType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exportOptions)
            });

            if (!response.ok) {
                throw new Error('Failed to export billing data');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `billing-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to export billing data. Please try again.');
            console.error('Error exporting billing data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (field, value) => {
        setExportOptions(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (field, value) => {
        setExportOptions(prev => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [field]: new Date(value).getTime()
            }
        }));
    };

    const toggleCustomField = (field) => {
        setExportOptions(prev => ({
            ...prev,
            customFields: prev.customFields.includes(field)
                ? prev.customFields.filter(f => f !== field)
                : [...prev.customFields, field]
        }));
    };

    if (loading) return <LoadingSpinner message="Preparing export..." />;
    if (error) return <ErrorMessage message={error} onRetry={handleExport} />;

    return (
        <div className="billing-export">
            <div className="export-header">
                <h2><FaDownload /> Billing Export</h2>
                <p>Export your billing data with customizable options</p>
            </div>

            <div className="export-options">
                <div className="option-group">
                    <label>Export Format</label>
                    <div className="format-buttons">
                        <button
                            className={`format-btn ${exportOptions.format === 'csv' ? 'active' : ''}`}
                            onClick={() => handleOptionChange('format', 'csv')}
                        >
                            <FaFileCsv /> CSV
                        </button>
                        <button
                            className={`format-btn ${exportOptions.format === 'xlsx' ? 'active' : ''}`}
                            onClick={() => handleOptionChange('format', 'xlsx')}
                        >
                            <FaFileExcel /> Excel
                        </button>
                        <button
                            className={`format-btn ${exportOptions.format === 'pdf' ? 'active' : ''}`}
                            onClick={() => handleOptionChange('format', 'pdf')}
                        >
                            <FaFilePdf /> PDF
                        </button>
                    </div>
                </div>

                <div className="option-group">
                    <label>Date Range</label>
                    <div className="date-inputs">
                        <div className="date-input">
                            <FaCalendar />
                            <input
                                type="date"
                                value={new Date(exportOptions.dateRange.start).toISOString().split('T')[0]}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                            />
                        </div>
                        <div className="date-input">
                            <FaCalendar />
                            <input
                                type="date"
                                value={new Date(exportOptions.dateRange.end).toISOString().split('T')[0]}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="option-group">
                    <label>Include Data</label>
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeInvoices}
                                onChange={(e) => handleOptionChange('includeInvoices', e.target.checked)}
                            />
                            Invoices
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={exportOptions.includePayments}
                                onChange={(e) => handleOptionChange('includePayments', e.target.checked)}
                            />
                            Payments
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={exportOptions.includeUsage}
                                onChange={(e) => handleOptionChange('includeUsage', e.target.checked)}
                            />
                            Usage Data
                        </label>
                    </div>
                </div>

                <div className="option-group">
                    <label>Group By</label>
                    <select
                        value={exportOptions.groupBy}
                        onChange={(e) => handleOptionChange('groupBy', e.target.value)}
                    >
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                        <option value="quarter">Quarterly</option>
                        <option value="year">Yearly</option>
                    </select>
                </div>

                <div className="option-group">
                    <label>Custom Fields</label>
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={exportOptions.customFields.includes('callDuration')}
                                onChange={() => toggleCustomField('callDuration')}
                            />
                            Call Duration
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={exportOptions.customFields.includes('callQuality')}
                                onChange={() => toggleCustomField('callQuality')}
                            />
                            Call Quality
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={exportOptions.customFields.includes('extension')}
                                onChange={() => toggleCustomField('extension')}
                            />
                            Extension Details
                        </label>
                    </div>
                </div>
            </div>

            <div className="export-actions">
                <button
                    className="export-btn"
                    onClick={handleExport}
                    disabled={loading}
                >
                    <FaDownload /> Export Data
                </button>
            </div>
        </div>
    );
};

export default BillingExport; 