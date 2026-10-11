import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 5.5C19 7 20 9 20 12c0 3-1 5-2.5 6.5" />
                <path d="M6.5 5.5C5 7 4 9 4 12c0 3 1 5 2.5 6.5" />
                <path d="M9 5c0-1.7 1.3-3 3-3s3 1.3 3 3v14c0 1.7-1.3 3-3 3s-3-1.3-3-3V5z" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </span>
            <span className="nav-brand-name">TripSplit</span>
          </div>
          <div className="nav-right">
            <ThemeToggle />
            {isAuthenticated ? (
              <button className="btn-primary" onClick={() => navigate('/trips')}>Dashboard</button>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
                <button className="btn-primary" onClick={() => navigate('/login?register=1')}>Get started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">Smart expense splitting for groups</div>
          <h1 className="hero-title">
            Split trip expenses<br />
            <span className="hero-title-accent">without the hassle</span>
          </h1>
          <p className="hero-subtitle">
            Track shared expenses, split bills evenly or by custom amounts, and settle up with friends — all in one place.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-lg" onClick={() => navigate('/login?register=1')}>
              Start splitting
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button className="btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <h2 className="features-title">Everything you need to split expenses</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Add members</h3>
              <p>Invite friends to your trip and track who's involved in every expense.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12" />
                  <path d="M6 8h12" />
                  <path d="m6 13 8.5 8" />
                  <path d="M6 13h3" />
                  <path d="M9 13c6.667 0 6.667-10 0-10" />
                </svg>
              </div>
              <h3>Track expenses</h3>
              <p>Log every expense with description, amount, category, and who paid.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Smart splitting</h3>
              <p>Split equally or set custom amounts per person — the choice is yours.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3>Settle up</h3>
              <p>See exactly who owes whom with auto-calculated settlements.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to split your next trip?</h2>
          <p>Create a trip, add your friends, and start tracking expenses in minutes.</p>
          <button className="btn-primary btn-lg" onClick={() => navigate('/login?register=1')}>Get started free</button>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} TripSplit. All rights reserved.</p>
      </footer>
    </div>
  )
}
