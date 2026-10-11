import React from 'react'
import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-layout">
      <nav className="top-nav">
        <div className="nav-inner">
          <div className="nav-left">
            <Link to="/trips" className="nav-brand">
              <span className="nav-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 5.5C19 7 20 9 20 12c0 3-1 5-2.5 6.5" />
                  <path d="M6.5 5.5C5 7 4 9 4 12c0 3-1 5-2.5 6.5" />
                  <path d="M9 5c0-1.7 1.3-3 3-3s3 1.3 3 3v14c0 1.7-1.3 3-3 3s-3-1.3-3-3V5z" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
              </span>
              <span className="nav-brand-name">TripSplit</span>
            </Link>
            <div className="nav-links">
              <NavLink to="/trips" end className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Trips
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link nav-link-active' : 'nav-link'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Admin
                </NavLink>
              )}
            </div>
          </div>
          <div className="nav-right">
            <ThemeToggle />
            {user && (
              <>
                <span className="nav-user">
                  <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                  <span className="nav-user-name">{user.name}</span>
                </span>
                <button className="btn-ghost btn-sm" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
