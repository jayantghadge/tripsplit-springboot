import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { CardSkeleton } from './LoadingSkeleton'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Good morning', emoji: '\u2615' }
  if (h < 17) return { text: 'Good afternoon', emoji: '\u2600\uFE0F' }
  return { text: 'Good evening', emoji: '\uD83C\uDF19' }
}

function formatDateRange(start, end) {
  if (!start && !end) return null
  if (start && end) {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    const opts = { month: 'short', day: 'numeric' }
    return `${s.toLocaleDateString('en-US', opts)} \u2013 ${e.toLocaleDateString('en-US', opts)}`
  }
  const d = new Date((start || end) + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TripList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTrips()
      .then(setTrips)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = getGreeting()

  return (
    <div className="container">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>
          <span className="greeting-emoji">{greeting.emoji}</span> {greeting.text}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p>
          {trips.length > 0
            ? `You have ${trips.length} trip${trips.length !== 1 ? 's' : ''} to check on`
            : 'Ready to plan your next adventure?'}
        </p>
      </div>

      {/* Stats */}
      {!loading && trips.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 5.5C19 7 20 9 20 12c0 3-1 5-2.5 6.5" />
                <path d="M6.5 5.5C5 7 4 9 4 12c0 3 1 5 2.5 6.5" />
                <path d="M9 5c0-1.7 1.3-3 3-3s3 1.3 3 3v14c0 1.7-1.3 3-3 3s-3-1.3-3-3V5z" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{trips.length}</div>
              <div className="stat-label">Active trips</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{trips.filter(t => t.destination).length}</div>
              <div className="stat-label">Destinations</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{new Date().getFullYear()}</div>
              <div className="stat-label">This year</div>
            </div>
          </div>
        </div>
      )}

      {/* Trips Section Header */}
      <div className="section-header">
        <span className="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
          </svg>
          Trips
        </span>
        <button className="btn-primary btn-sm" onClick={() => navigate('/trips/new')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Trip
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!loading && trips.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray-400)' }}>
              <path d="M17.5 5.5C19 7 20 9 20 12c0 3-1 5-2.5 6.5" />
              <path d="M6.5 5.5C5 7 4 9 4 12c0 3 1 5 2.5 6.5" />
              <path d="M9 5c0-1.7 1.3-3 3-3s3 1.3 3 3v14c0 1.7-1.3 3-3 3s-3-1.3-3-3V5z" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No trips yet</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
            Create your first trip and start splitting expenses with friends.
          </p>
          <button className="btn-primary" onClick={() => navigate('/trips/new')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create your first trip
          </button>
        </div>
      )}

      {/* Trip Cards */}
      {!loading && trips.map(t => {
        const dateRange = formatDateRange(t.startDate, t.endDate)
        return (
          <div key={t.id} className="card trip-card" onClick={() => navigate(`/trips/${t.id}`)}>
            <div className="trip-card-inner">
              <div className="trip-card-left">
                <div className="trip-card-name">{t.name}</div>
                {t.destination && <div className="trip-card-dest">{t.destination}</div>}
                <div className="trip-card-footer">
                  {dateRange && (
                    <span className="trip-card-meta">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {dateRange}
                    </span>
                  )}
                  {t.description && (
                    <span className="trip-card-meta">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      {t.description.length > 40 ? t.description.slice(0, 40) + '\u2026' : t.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="trip-card-right">
                <span className="trip-card-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
