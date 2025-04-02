import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaDownload, FaEye, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './InvoiceGeneration.css';

const InvoiceGeneration = ({ pbxType, filters }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, [pbxType]);

    const fetchInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/billing/invoices/${pbxType}`);
            if (!response.ok) {
                throw new Error('Failed to fetch invoices');
            }
            const data = await response.json();
            setInvoices(data);
        } catch (err) {
            setError('Failed to load invoices. Please try again.');
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateInvoice = async () => {
        setGenerating(true);
        try {
            const response = await fetch(`/api/billing/invoices/${pbxType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...filters
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate invoice');
            }

            const data = await response.json();
            setInvoices(prev => [...prev, data]);
        } catch (err) {
            setError('Failed to generate invoice. Please try again.');
            console.error('Error generating invoice:', err);
        } finally {
            setGenerating(false);
        }
    };

    const loadInvoicePreview = async (invoiceId) => {
        try {
            const response = await fetch(`/api/billing/invoices/${pbxType}/${invoiceId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch invoice details');
            }
            const data = await response.json();
            setPreviewInvoice(data);
            setShowPreview(true);
        } catch (err) {
            setError('Failed to load invoice preview. Please try again.');
            console.error('Error loading invoice preview:', err);
        }
    };

    const downloadInvoice = async (invoiceId) => {
        try {
            const response = await fetch(`/api/billing/invoices/${pbxType}/${invoiceId}/download`);
            if (!response.ok) {
                throw new Error('Failed to download invoice');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Failed to download invoice. Please try again.');
            console.error('Error downloading invoice:', err);
        }
    };

    const deleteInvoice = async (invoiceId) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) {
            return;
        }

        try {
            const response = await fetch(`/api/billing/invoices/${pbxType}/${invoiceId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete invoice');
            }

            setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
        } catch (err) {
            setError('Failed to delete invoice. Please try again.');
            console.error('Error deleting invoice:', err);
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

    if (loading) return <LoadingSpinner message="Loading invoices..." />;
    if (error) return <ErrorMessage message={error} onRetry={fetchInvoices} />;

    return (
        <div className="invoice-generation">
            <div className="invoice-header">
                <h2><FaFileInvoiceDollar /> Invoice Management</h2>
                <button 
                    className="generate-btn"
                    onClick={generateInvoice}
                    disabled={generating}
                >
                    {generating ? (
                        <>
                            <FaSpinner className="spinner" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FaPlus />
                            Generate New Invoice
                        </>
                    )}
                </button>
            </div>

            <div className="invoice-list">
                {invoices.length === 0 ? (
                    <div className="no-invoices">
                        <p>No invoices found. Generate a new invoice to get started.</p>
                    </div>
                ) : (
                    invoices.map(invoice => (
                        <div key={invoice.id} className="invoice-card">
                            <div className="invoice-info">
                                <div className="invoice-number">
                                    Invoice #{invoice.invoiceNumber}
                                </div>
                                <div className="invoice-date">
                                    Generated on {formatDate(invoice.createdAt)}
                                </div>
                                <div className="invoice-amount">
                                    Total: {formatCurrency(invoice.totalAmount)}
                                </div>
                            </div>
                            <div className="invoice-actions">
                                <button 
                                    className="action-btn preview-btn"
                                    onClick={() => loadInvoicePreview(invoice.id)}
                                >
                                    <FaEye /> Preview
                                </button>
                                <button 
                                    className="action-btn download-btn"
                                    onClick={() => downloadInvoice(invoice.id)}
                                >
                                    <FaDownload /> Download
                                </button>
                                <button 
                                    className="action-btn delete-btn"
                                    onClick={() => deleteInvoice(invoice.id)}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showPreview && previewInvoice && (
                <div className="invoice-preview-modal">
                    <div className="preview-content">
                        <div className="preview-header">
                            <h3>Invoice Preview</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setShowPreview(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="preview-body">
                            <div className="preview-section">
                                <h4>Invoice Details</h4>
                                <p>Invoice Number: {previewInvoice.invoiceNumber}</p>
                                <p>Date: {formatDate(previewInvoice.createdAt)}</p>
                                <p>Due Date: {formatDate(previewInvoice.dueDate)}</p>
                            </div>
                            <div className="preview-section">
                                <h4>Billing Period</h4>
                                <p>
                                    {formatDate(previewInvoice.billingPeriod.start)} - 
                                    {formatDate(previewInvoice.billingPeriod.end)}
                                </p>
                            </div>
                            <div className="preview-section">
                                <h4>Items</h4>
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Quantity</th>
                                            <th>Rate</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewInvoice.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.description}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatCurrency(item.rate)}</td>
                                                <td>{formatCurrency(item.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3">Total</td>
                                            <td>{formatCurrency(previewInvoice.totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceGeneration; 