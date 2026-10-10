import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { rupee } from '../utils'
import AddExpense from './AddExpense'
import Summary from './Summary'
import { TripDetailSkeleton } from './LoadingSkeleton'

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trip, setTrip] = useState(null)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [newMemberName, setNewMemberName] = useState('')
  const [viewToken, setViewToken] = useState('')
  const [showViewLink, setShowViewLink] = useState(false)
  const [summary, setSummary] = useState(null)
  const [activeTab, setActiveTab] = useState('settlements')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getTrip(id),
      api.getMembers(id),
      api.getExpenses(id)
    ]).then(([t, m, e]) => {
      setTrip(t)
      setMembers(m)
      setExpenses(e)
    }).catch(() => navigate('/trips', { replace: true }))
    .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleDeleteTrip() {
    if (!window.confirm('Delete this trip and all its data? This cannot be undone.')) return
    await api.deleteTrip(id)
    navigate('/trips', { replace: true })
  }

  async function handleAddMember(e) {
    e.preventDefault()
    if (!newMemberName.trim()) return
    await api.addMember(id, newMemberName.trim())
    setNewMemberName('')
    const m = await api.getMembers(id)
    setMembers(m)
  }

  async function handleRemoveMember(memberId) {
    setMembers(prev => prev.filter(m => m.id !== memberId))
    try {
      await api.removeMember(id, memberId)
    } catch {
      const m = await api.getMembers(id)
      setMembers(m)
    }
  }

  async function handleDeleteExpense(expenseId) {
    if (!window.confirm('Delete this expense?')) return
    setExpenses(prev => prev.filter(e => e.id !== expenseId))
    await api.deleteExpense(expenseId)
  }

  function handleEditExpense(exp) {
    setEditingExpense(exp)
    setShowAddExpense(true)
  }

  async function handleCalculate() {
    setActiveTab('settlements')
    const result = await api.calculateSettlements(id)
    setSettlements(result)
  }

  async function handleShowSummary() {
    setActiveTab('summary')
    if (!summary) {
      const s = await api.getSummary(id)
      setSummary(s)
    }
  }

  async function handleExpenseSaved() {
    setShowAddExpense(false)
    setEditingExpense(null)
    const e = await api.getExpenses(id)
    setExpenses(e)
  }

  function handleCancelExpense() {
    setShowAddExpense(false)
    setEditingExpense(null)
  }

  async function handleShowViewLink() {
    const data = await api.getViewToken(id)
    setViewToken(data.token)
    setShowViewLink(true)
  }

  async function handleRegenerateToken() {
    if (!window.confirm('Regenerating will invalidate the old link. Continue?')) return
    const data = await api.regenerateToken(id)
    setViewToken(data.token)
  }

  if (loading) return <TripDetailSkeleton />
  if (!trip) return null

  const viewUrl = `${window.location.origin}/view/${viewToken}`
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="container">
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/trips')} style={{ marginBottom: 12, padding: '4px 10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              All trips
            </button>
            <h1 style={{ margin: 0, lineHeight: 1.15, fontSize: 28, letterSpacing: '-0.5px' }}>{trip.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {trip.destination && (
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                  </svg>
                  {trip.destination}
                </span>
              )}
              {trip.startDate && (
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {trip.startDate}{trip.endDate ? ` \u2013 ${trip.endDate}` : ''}
                </span>
              )}
              {trip.description && (
                <span style={{ fontSize: 14, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-400)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  {trip.description.length > 50 ? trip.description.slice(0, 50) + '\u2026' : trip.description}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2" style={{ flexShrink: 0, paddingTop: 36 }}>
            <button className="btn-secondary btn-sm" onClick={() => navigate(`/trips/${id}/edit`)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button className="btn-danger btn-sm" onClick={handleDeleteTrip}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-icon stat-icon-purple" style={{ width: 36, height: 36 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 18 }}>{members.length}</div>
            <div className="stat-label">Members</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-icon stat-icon-green" style={{ width: 36, height: 36 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 18 }}>{expenses.length}</div>
            <div className="stat-label">Expenses</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-icon stat-icon-amber" style={{ width: 36, height: 36 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 18 }}>{rupee(totalExpenses)}</div>
            <div className="stat-label">Total spent</div>
          </div>
        </div>
      </div>

      {/* Share Link */}
      <div className="card share-card card-compact">
        <div className="card-row">
          <span className="card-label" style={{ fontSize: 13, gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share this trip
          </span>
          <button className="btn-ghost btn-sm" onClick={showViewLink ? () => setShowViewLink(false) : handleShowViewLink}>
            {showViewLink ? 'Hide' : 'Show link'}
          </button>
        </div>
        {showViewLink && (
          <div className="share-row">
            <input value={viewUrl} readOnly onClick={e => e.target.select()} />
            <button className="btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(viewUrl)}>Copy</button>
            <button className="btn-ghost btn-sm" onClick={handleRegenerateToken}>New</button>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card">
        <div className="card-header">
          <span className="card-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Members
          </span>
        </div>
        <div className="member-list">
          {members.map(m => (
            <span key={m.id} className="member-chip">
              <span className="member-avatar">{m.name.charAt(0).toUpperCase()}</span>
              {m.name}
              <button className="member-remove" onClick={() => handleRemoveMember(m.id)}>&times;</button>
            </span>
          ))}
        </div>
        <form className="member-add" onSubmit={handleAddMember}>
          <input placeholder="Add member by name" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
          <button type="submit" className="btn-primary btn-sm">Add</button>
        </form>
      </div>

      {/* Expenses */}
      <div className="card">
        <div className="card-header">
          <span className="card-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Expenses
          </span>
          <button className="btn-primary btn-sm" onClick={() => { setEditingExpense(null); setShowAddExpense(true) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add expense
          </button>
        </div>

        {showAddExpense && (
          <AddExpense
            key={editingExpense ? editingExpense.id : 'new'}
            tripId={id}
            members={members}
            onSaved={handleExpenseSaved}
            onCancel={handleCancelExpense}
            expense={editingExpense}
          />
        )}

        <div className="expense-list">
          {expenses.length === 0 && (
            <div className="empty-state">
              {showAddExpense ? 'Fill in the form above to add an expense' : 'No expenses yet. Add one!'}
            </div>
          )}
          {expenses.map(e => (
            <div key={e.id} className="expense-row">
              <div className="expense-info">
                <span className="expense-desc">{e.description}</span>
                <span className="expense-meta">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {e.paidByName} &middot; {e.date}
                </span>
              </div>
              <div className="expense-right">
                {e.category && <span className="tag">{e.category}</span>}
                <span className="expense-amount">{rupee(e.amount)}</span>
                <button className="btn-icon" onClick={() => handleEditExpense(e)} title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteExpense(e.id)} title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'settlements' ? 'tab-active' : ''}`} onClick={handleCalculate}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Settlements
        </button>
        <button className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`} onClick={handleShowSummary}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Summary
        </button>
      </div>

      {activeTab === 'settlements' && (
        <div className="tab-content">
          {settlements.length === 0 ? (
            <div className="empty-state">Click the Settlements tab to calculate who owes whom</div>
          ) : (
            settlements.map((s, i) => (
              <div key={i} className="settlement-row">
                <span className="settlement-from">{s.fromName}</span>
                <span className="settlement-arrow">owes</span>
                <span className="settlement-to">{s.toName}</span>
                <span className="settlement-amount">{rupee(s.amount)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'summary' && <Summary data={summary} />}
    </div>
  )
}
