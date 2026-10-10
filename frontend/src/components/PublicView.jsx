import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import { rupee } from '../utils'

export default function PublicView() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPublicTrip(token)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-400)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ marginBottom: 8 }}>Invalid or expired link</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{error}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Ask the trip admin for a new link.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="public-view">
      <div className="public-header">
        <h1>{data.name}</h1>
        {data.destination && <p>{data.destination}</p>}
      </div>

      {/* Members */}
      <div className="card">
        <div className="card-title">
          <span className="dot dot-purple" />
          Members
        </div>
        <div className="member-list">
          {data.members.map((m, i) => (
            <span key={i} className="member-chip" style={{ cursor: 'default' }}>{m.name}</span>
          ))}
        </div>
      </div>

      {/* Expenses */}
      <div className="card">
        <div className="card-title">
          <span className="dot dot-green" />
          Expenses
        </div>
        <div>
          {data.expenses.length === 0 && <div className="empty-state">No expenses yet</div>}
          {data.expenses.map(e => (
            <div key={e.id} className="expense-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{e.description}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Paid by {e.paidByName} &middot; {e.date}
                  {e.category && <><span style={{ margin: '0 4px' }}>&middot;</span><span className="tag">{e.category}</span></>}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  Split: {e.splits.map((s, i) => (
                    <span key={i}>{s.memberName} ({rupee(s.amount)}){i < e.splits.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>{rupee(e.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settlements */}
      <div className="card">
        <div className="card-title">
          <span className="dot" style={{ background: 'var(--accent)' }} />
          Settlements
        </div>
        <div>
          {data.settlements.length === 0 ? (
            <div className="empty-state">All settled up!</div>
          ) : (
            data.settlements.map((s, i) => (
              <div key={i} className="settlement-row">
                <span className="settlement-from">{s.fromName}</span>
                <span className="settlement-arrow">owes</span>
                <span className="settlement-to">{s.toName}</span>
                <span className="settlement-amount">{rupee(s.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 32 }}>
        Powered by <strong>TripSplit</strong>
      </p>
    </div>
  )
}
