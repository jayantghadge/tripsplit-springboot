import React from 'react'
import { rupee } from '../utils'
import PieChart from './PieChart'

export default function Summary({ data, currentUserName }) {
  if (!data) {
    return (
      <div className="tab-content">
        <div className="empty-state">Summary will appear here once you add expenses.</div>
      </div>
    )
  }

  const { totalSpent = 0, categoryBreakdown = [], perPerson = [] } = data
  const hasExpenses = Number(totalSpent) > 0 && perPerson.length > 0

  if (!hasExpenses) {
    return (
      <div className="tab-content">
        <div className="empty-state">No expenses yet. Add one to see the spending summary.</div>
      </div>
    )
  }

  return (
    <div className="summary-section">
      <div className="summary-header">
        <h2>Summary</h2>
        <div className="summary-total">Total: <strong>{rupee(totalSpent)}</strong></div>
      </div>

      <div className="summary-grid">
        {/* By Category */}
        {categoryBreakdown.length > 0 && (
          <div className="card">
            <div className="card-title">
              <span className="dot dot-purple" />
              By Category
            </div>
            <div className="summary-chart-row">
              <div className="summary-chart">
                <PieChart data={categoryBreakdown} size={160} />
              </div>
              <div className="summary-chart-legend">
                <div className="summary-list">
                  {categoryBreakdown.map((c, i) => (
                    <div key={i} className="summary-row">
                      <div className="summary-row-left">
                        <span className="color-dot" style={{ background: c.color }} />
                        <span>{c.category}</span>
                      </div>
                      <div className="summary-row-right">
                        <strong>{rupee(c.amount)}</strong>
                        <span className="summary-pct">{c.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Per Person */}
        <div className="card">
          <div className="card-title">
            <span className="dot dot-green" />
            Per Person
          </div>
          <div className="summary-list">
            <div className="summary-row summary-row-header">
              <span>Name</span>
              <div className="summary-row-right">
                <span className="col-paid">Paid</span>
                <span className="col-share">Share</span>
                <span className="col-net">Net</span>
              </div>
            </div>
            {perPerson.map((p, i) => {
              const isYou = currentUserName && p.name === currentUserName
              return (
                <div key={i} className={`summary-row${isYou ? ' is-you' : ''}`}>
                  <span className="summary-name">
                    {p.name}
                    {isYou && <span className="you-badge">You</span>}
                  </span>
                  <div className="summary-row-right">
                    <span className="col-paid paid-amount">{rupee(p.paid)}</span>
                    <span className="col-share share-amount">{rupee(p.share)}</span>
                    <span className={`col-net ${Number(p.net) >= 0 ? 'net-positive' : 'net-negative'}`}>
                      {Number(p.net) >= 0 ? '+' : ''}{rupee(p.net)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
