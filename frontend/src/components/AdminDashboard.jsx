import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/trips', { replace: true })
      return
    }
    Promise.all([
      api.getAdminStats(),
      api.getAdminUsers(),
    ]).then(([s, u]) => {
      setStats(s)
      setUsers(u)
    }).catch(err => setError(err.message))
    .finally(() => setLoading(false))
  }, [isAdmin, navigate])

  async function handleDeleteUser(userId, userName) {
    if (!window.confirm(`Delete user "${userName}"? All their trips and data will remain.`)) return
    try {
      await api.deleteAdminUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p className="text-tertiary">System overview and user management</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-users">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalUsers}</span>
              <span className="stat-label"> Users</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-trips">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalTrips}</span>
              <span className="stat-label"> Trips</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-expenses">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalExpenses}</span>
              <span className="stat-label"> Expenses</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-settlements">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalSettlements}</span>
              <span className="stat-label"> Settlements</span>
            </div>
          </div>
        </div>
      )}

      <div className="admin-section">
        <h3>Users</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className="empty-cell">No users found</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id}>
                  <td className="cell-name">
                    <span className="avatar-sm">{u.name?.charAt(0).toUpperCase()}</span>
                    {u.name}
                    {u.id === user?.id && <span className="badge-you">You</span>}
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge ${u.role === 'ROLE_ADMIN' ? 'role-admin' : 'role-user'}`}>{u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</span></td>
                  <td className="text-tertiary">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    {u.id !== user?.id && (
                      <button className="btn-ghost btn-sm btn-danger" onClick={() => handleDeleteUser(u.id, u.name)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
