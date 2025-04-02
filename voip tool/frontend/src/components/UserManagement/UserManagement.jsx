import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaKey, FaSearch, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'Agent'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, roleFilter, users]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.message || 'Failed to fetch users';
                } catch (e) {
                    errorMessage = errorText || 'Failed to fetch users';
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (error.message.includes('No authentication token found')) {
                setError('Please log in to access this page');
            } else if (error.message.includes('Access denied')) {
                setError('You do not have permission to view users. Please contact an administrator.');
            } else {
                setError(error.message || 'Failed to load users. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        
        setFilteredUsers(filtered);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add user');
            }
            
            await fetchUsers();
            setShowAddModal(false);
            setFormData({ username: '', email: '', password: '', role: 'Agent' });
        } catch (error) {
            console.error('Error adding user:', error);
            setError(error.message || 'Failed to add user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }
            
            await fetchUsers();
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData({ username: '', email: '', password: '', role: 'Agent' });
        } catch (error) {
            console.error('Error updating user:', error);
            setError(error.message || 'Failed to update user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset password');
            }
            
            const data = await response.json();
            alert(`Password reset successful. New password: ${data.newPassword}`);
        } catch (error) {
            console.error('Error resetting password:', error);
            setError(error.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete user');
                }
                
                await fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                setError(error.message || 'Failed to delete user. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="user-management">
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
            
            <div className="user-header">
                <h2>User Management</h2>
                <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
                    <FaPlus /> Add User
                </button>
            </div>

            <div className="user-filters">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <FaFilter />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Agent">Agent</option>
                    </select>
                </div>
            </div>

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td className="action-buttons">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setFormData({
                                                username: user.username,
                                                email: user.email,
                                                role: user.role,
                                                password: ''
                                            });
                                            setShowEditModal(true);
                                        }}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="reset-btn"
                                        onClick={() => handleResetPassword(user._id)}
                                    >
                                        <FaKey />
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeleteUser(user._id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add New User</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Agent">Agent</option>
                                </select>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    Add User
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit User</h3>
                        <form onSubmit={handleEditUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Agent">Agent</option>
                                </select>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    Update User
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement; 