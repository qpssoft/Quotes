import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { usersApi } from '../services/usersApi';
import { User } from '../services/authService';
import './UsersPage.css';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'Admin' | 'Contributor' | 'Authenticated'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formRole, setFormRole] = useState<'Authenticated' | 'Contributor' | 'Admin'>('Authenticated');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await usersApi.assignRole(editingUser.Id, formRole);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      alert('Failed to update user role');
      console.error(err);
    }
  };

  const handleBanUser = async (user: User) => {
    const action = user.IsActive !== false ? 'ban' : 'unban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      if (user.IsActive !== false) {
        await usersApi.banUser(user.Id);
      } else {
        await usersApi.unbanUser(user.Id);
      }
      loadUsers();
    } catch (err) {
      alert(`Failed to ${action} user`);
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This will also delete all their quotes.')) return;

    try {
      await usersApi.deleteUser(id);
      loadUsers();
    } catch (err) {
      alert('Failed to delete user');
      console.error(err);
    }
  };

  const startEditRole = (user: User) => {
    setEditingUser(user);
    setFormRole(user.Role as any);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.Role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <Layout>
      <div className="users-page">
        <div className="page-header">
          <div className="header-left">
            <h2>User Management</h2>
            <p className="subtitle">Manage user accounts and permissions</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={loadUsers}>Retry</button>
          </div>
        )}

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Contributor">Contributor</option>
              <option value="Authenticated">Authenticated</option>
            </select>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-chip">Total Users: {users.length}</div>
          <div className="stat-chip">Filtered: {filteredUsers.length}</div>
          <div className="stat-chip">
            Admins: {users.filter((u) => u.Role === 'Admin').length}
          </div>
          <div className="stat-chip">
            Contributors: {users.filter((u) => u.Role === 'Contributor').length}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Provider</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.Id} className={user.IsActive === false ? 'banned-user' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {user.Name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name-cell">{user.Name}</div>
                          <div className="user-email-cell">{user.Email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="provider-badge">{user.Provider}</span>
                    </td>
                    <td>
                      <span className={`role-badge-table role-${user.Role.toLowerCase()}`}>
                        {user.Role}
                      </span>
                    </td>
                    <td>
                      {user.IsActive === false ? (
                        <span className="status-badge banned">Banned</span>
                      ) : (
                        <span className="status-badge active">Active</span>
                      )}
                    </td>
                    <td className="date-cell">
                      {user.CreatedAt
                        ? new Date(user.CreatedAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="date-cell">
                      {user.LastLogin
                        ? new Date(user.LastLogin).toLocaleString()
                        : 'Never'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit-role"
                          onClick={() => startEditRole(user)}
                          title="Edit Role"
                        >
                          👤
                        </button>
                        <button
                          className={`btn-action ${user.IsActive !== false ? 'btn-ban' : 'btn-unban'}`}
                          onClick={() => handleBanUser(user)}
                          title={user.IsActive !== false ? 'Ban User' : 'Unban User'}
                        >
                          {user.IsActive !== false ? '🚫' : '✅'}
                        </button>
                        <button
                          className="btn-action btn-delete-user"
                          onClick={() => handleDeleteUser(user.Id)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        )}

        {/* Edit Role Modal */}
        {editingUser && (
          <div className="modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit User Role</h3>
                <button className="modal-close" onClick={() => setEditingUser(null)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateRole}>
                <div className="modal-body">
                  <div className="user-info-modal">
                    <div className="user-avatar-large">
                      {editingUser.Name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="user-name-modal">{editingUser.Name}</div>
                      <div className="user-email-modal">{editingUser.Email}</div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      className="role-select"
                    >
                      <option value="Authenticated">Authenticated</option>
                      <option value="Contributor">Contributor</option>
                      <option value="Admin">Admin</option>
                    </select>

                    <div className="role-descriptions">
                      <div className="role-desc">
                        <strong>Authenticated:</strong> Basic user access, can view quotes
                      </div>
                      <div className="role-desc">
                        <strong>Contributor:</strong> Can submit quotes for review
                      </div>
                      <div className="role-desc">
                        <strong>Admin:</strong> Full access to admin center, can manage quotes and users
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
