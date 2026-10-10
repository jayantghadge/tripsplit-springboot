import React, { useState } from 'react'
import { api } from '../api'
import { rupee } from '../utils'

export default function AddExpense({ tripId, members, onSaved, onCancel, expense }) {
  const isEditing = Boolean(expense)

  const [description, setDescription] = useState(expense?.description || '')
  const [amount, setAmount] = useState(expense?.amount?.toString() || '')
  const [date, setDate] = useState(expense?.date || new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState(expense?.category || '')
  const [paidByName, setPaidByName] = useState(expense?.paidByName || members[0]?.name || '')
  const [splitType, setSplitType] = useState('equal')
  const [customAmounts, setCustomAmounts] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleCustomAmount(name, val) {
    setCustomAmounts(prev => ({ ...prev, [name]: val }))
  }

  function buildSplits() {
    if (splitType === 'equal') {
      const perPerson = members.length > 0 ? (parseFloat(amount || 0) / members.length).toFixed(2) : '0.00'
      return members.map(m => ({
        memberName: m.name,
        amount: parseFloat(perPerson)
      }))
    }
    return members.map(m => ({
      memberName: m.name,
      amount: parseFloat(customAmounts[m.name] || 0)
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!description || !amount || !paidByName) {
      setError('Fill in all required fields')
      return
    }
    if (members.length === 0) {
      setError('Add at least one member first')
      return
    }

    const splits = buildSplits()
    if (splitType === 'custom') {
      const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0)
      if (Math.abs(totalSplit - parseFloat(amount)) > 0.02) {
        setError(`Split total (${rupee(totalSplit)}) doesn't match amount (${rupee(parseFloat(amount))})`)
        return
      }
    }

    setSaving(true)
    try {
      const body = {
        tripId,
        paidByName,
        amount: parseFloat(amount),
        description,
        date,
        category: category || undefined,
        splits
      }
      if (isEditing) {
        await api.updateExpense(expense.id, body)
      } else {
        await api.addExpense(body)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="expense-form">
      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-500)' }}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        {isEditing ? 'Edit expense' : 'Add expense'}
      </h4>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Description */}
        <div>
          <label htmlFor="desc">Description</label>
          <input id="desc" placeholder="e.g. Dinner at beach shack" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>

        {/* Paid by & Amount */}
        <div className="form-row">
          <div>
            <label htmlFor="paidBy">Paid by</label>
            <select id="paidBy" value={paidByName} onChange={e => setPaidByName(e.target.value)} required>
              <option value="">Select...</option>
              {members.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amount">Amount (₹)</label>
            <input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
        </div>

        {/* Date & Category */}
        <div className="form-row">
          <div>
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select...</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transport">Transport</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Fuel">Fuel</option>
              <option value="Groceries">Groceries</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Split Type */}
        <div>
          <label style={{ marginBottom: 8 }}>Split type</label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" checked={splitType === 'equal'} onChange={() => setSplitType('equal')} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              Equal
            </label>
            <label className="radio-label">
              <input type="radio" checked={splitType === 'custom'} onChange={() => setSplitType('custom')} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Unequal
            </label>
          </div>

          {splitType === 'equal' && members.length > 0 && (
            <div style={{
              background: 'var(--success-50)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: 13,
              color: 'var(--success-600)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Each person pays <strong>{rupee(parseFloat(amount || 0) / members.length)}</strong>
            </div>
          )}

          {splitType === 'custom' && (
            <div className="split-custom-box">
              {members.map(m => (
                <div key={m.name} className="split-row">
                  <span className="split-row-label">{m.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={customAmounts[m.name] ?? ''}
                    onChange={e => handleCustomAmount(m.name, e.target.value)}
                  />
                </div>
              ))}
              <div className="divider" style={{ margin: '8px 0' }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13
              }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Total split</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {rupee(members.reduce((s, m) => s + parseFloat(customAmounts[m.name] || 0), 0))}
                  {amount && <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}> / {rupee(parseFloat(amount))}</span>}
                </strong>
              </div>
            </div>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
