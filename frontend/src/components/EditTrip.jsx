import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

export default function EditTrip() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditing) {
      api.getTrip(id).then(t => {
        setName(t.name)
        setDestination(t.destination || '')
        setDescription(t.description || '')
        setStartDate(t.startDate || '')
        setEndDate(t.endDate || '')
      })
    }
  }, [id, isEditing])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const data = { name, destination, description, startDate, endDate }
    try {
      if (isEditing) {
        await api.updateTrip(id, data)
      } else {
        await api.createTrip(data)
      }
      navigate('/trips', { replace: true })
    } catch {
      setSaving(false)
    }
  }

  const pageTitle = isEditing ? 'Edit trip' : 'Create a trip'
  const pageDesc = isEditing ? 'Update your trip details below' : 'Tell us about your trip'

  return (
    <div className="container" style={{ maxWidth: 620 }}>
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 28 }}>
        <button className="btn-ghost btn-sm" onClick={() => navigate('/trips')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>{pageTitle}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 2 }}>{pageDesc}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Trip Name */}
          <div>
            <label htmlFor="name">
              Trip name <span style={{ color: 'var(--danger-500)' }}>*</span>
            </label>
            <input
              id="name"
              placeholder="e.g. Goa Beach Trip"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Destination */}
          <div>
            <label htmlFor="dest">Destination</label>
            <input
              id="dest"
              placeholder="e.g. Goa, India"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              placeholder="A short description of the trip..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Dates */}
          <div>
            <label style={{ marginBottom: 10 }}>Trip dates</label>
            <div className="form-row">
              <div>
                <label htmlFor="start" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 4 }}>Start date</label>
                <input id="start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label htmlFor="end" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 4 }}>End date</label>
                <input id="end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Actions */}
          <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/trips')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Saving...
                </>
              ) : isEditing ? 'Save changes' : 'Create trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
