import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaPhone, FaUser, FaDollarSign, FaSpinner } from 'react-icons/fa';
import './FilterModal.css';

const FilterModal = ({ isOpen, onClose, onApply, currentFilters, pbxType }) => {
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

    const [extensions, setExtensions] = useState([]);
    const [loadingExtensions, setLoadingExtensions] = useState(false);
    const [extensionError, setExtensionError] = useState(null);

    useEffect(() => {
        if (currentFilters) {
            setFilters(currentFilters);
        }
    }, [currentFilters]);

    useEffect(() => {
        if (isOpen && pbxType) {
            loadExtensions();
        }
    }, [isOpen, pbxType]);

    const loadExtensions = async () => {
        setLoadingExtensions(true);
        setExtensionError(null);
        try {
            const response = await fetch(`/api/${pbxType}/extensions`);
            if (!response.ok) {
                throw new Error('Failed to load extensions');
            }
            const data = await response.json();
            setExtensions(data);
        } catch (error) {
            setExtensionError('Failed to load extensions. Please try again.');
            console.error('Error loading extensions:', error);
        } finally {
            setLoadingExtensions(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply(filters);
    };

    const handleReset = () => {
        setFilters({
            dateRange: {
                start: new Date().setMonth(new Date().getMonth() - 1),
                end: new Date()
            },
            callTypes: ['all'],
            extensions: ['all'],
            minCost: 0,
            maxCost: Infinity
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Filter Billing Data</h3>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="filter-section">
                        <h4><FaCalendarAlt /> Date Range</h4>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={new Date(filters.dateRange.start).toISOString().split('T')[0]}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    dateRange: {
                                        ...filters.dateRange,
                                        start: new Date(e.target.value).getTime()
                                    }
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={new Date(filters.dateRange.end).toISOString().split('T')[0]}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    dateRange: {
                                        ...filters.dateRange,
                                        end: new Date(e.target.value).getTime()
                                    }
                                })}
                            />
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4><FaPhone /> Call Types</h4>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.callTypes.includes('all')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFilters({
                                                ...filters,
                                                callTypes: ['all']
                                            });
                                        } else {
                                            setFilters({
                                                ...filters,
                                                callTypes: []
                                            });
                                        }
                                    }}
                                />
                                All Types
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.callTypes.includes('inbound')}
                                    onChange={(e) => {
                                        const newTypes = e.target.checked
                                            ? [...filters.callTypes.filter(t => t !== 'all'), 'inbound']
                                            : filters.callTypes.filter(t => t !== 'inbound');
                                        setFilters({
                                            ...filters,
                                            callTypes: newTypes.length ? newTypes : ['all']
                                        });
                                    }}
                                />
                                Inbound Calls
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.callTypes.includes('outbound')}
                                    onChange={(e) => {
                                        const newTypes = e.target.checked
                                            ? [...filters.callTypes.filter(t => t !== 'all'), 'outbound']
                                            : filters.callTypes.filter(t => t !== 'outbound');
                                        setFilters({
                                            ...filters,
                                            callTypes: newTypes.length ? newTypes : ['all']
                                        });
                                    }}
                                />
                                Outbound Calls
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.callTypes.includes('internal')}
                                    onChange={(e) => {
                                        const newTypes = e.target.checked
                                            ? [...filters.callTypes.filter(t => t !== 'all'), 'internal']
                                            : filters.callTypes.filter(t => t !== 'internal');
                                        setFilters({
                                            ...filters,
                                            callTypes: newTypes.length ? newTypes : ['all']
                                        });
                                    }}
                                />
                                Internal Calls
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.callTypes.includes('missed')}
                                    onChange={(e) => {
                                        const newTypes = e.target.checked
                                            ? [...filters.callTypes.filter(t => t !== 'all'), 'missed']
                                            : filters.callTypes.filter(t => t !== 'missed');
                                        setFilters({
                                            ...filters,
                                            callTypes: newTypes.length ? newTypes : ['all']
                                        });
                                    }}
                                />
                                Missed Calls
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.callTypes.includes('failed')}
                                    onChange={(e) => {
                                        const newTypes = e.target.checked
                                            ? [...filters.callTypes.filter(t => t !== 'all'), 'failed']
                                            : filters.callTypes.filter(t => t !== 'failed');
                                        setFilters({
                                            ...filters,
                                            callTypes: newTypes.length ? newTypes : ['all']
                                        });
                                    }}
                                />
                                Failed Calls
                            </label>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4><FaUser /> Extensions</h4>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filters.extensions.includes('all')}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFilters({
                                                ...filters,
                                                extensions: ['all']
                                            });
                                        } else {
                                            setFilters({
                                                ...filters,
                                                extensions: []
                                            });
                                        }
                                    }}
                                />
                                All Extensions
                            </label>
                            {loadingExtensions ? (
                                <div className="loading-extensions">
                                    <FaSpinner className="spinner" />
                                    <span>Loading extensions...</span>
                                </div>
                            ) : extensionError ? (
                                <div className="extension-error">
                                    {extensionError}
                                    <button onClick={loadExtensions} className="retry-btn">
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                extensions.map(extension => (
                                    <label key={extension.id}>
                                        <input
                                            type="checkbox"
                                            checked={filters.extensions.includes(extension.id)}
                                            onChange={(e) => {
                                                const newExtensions = e.target.checked
                                                    ? [...filters.extensions.filter(e => e !== 'all'), extension.id]
                                                    : filters.extensions.filter(e => e !== extension.id);
                                                setFilters({
                                                    ...filters,
                                                    extensions: newExtensions.length ? newExtensions : ['all']
                                                });
                                            }}
                                        />
                                        {extension.name || extension.number}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4><FaDollarSign /> Cost Range</h4>
                        <div className="form-group">
                            <label>Minimum Cost</label>
                            <input
                                type="number"
                                value={filters.minCost}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    minCost: parseFloat(e.target.value) || 0
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Maximum Cost</label>
                            <input
                                type="number"
                                value={filters.maxCost === Infinity ? '' : filters.maxCost}
                                onChange={(e) => setFilters({
                                    ...filters,
                                    maxCost: e.target.value ? parseFloat(e.target.value) : Infinity
                                })}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="reset-btn" onClick={handleReset}>
                            Reset Filters
                        </button>
                        <button type="submit" className="apply-btn">
                            Apply Filters
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FilterModal; 