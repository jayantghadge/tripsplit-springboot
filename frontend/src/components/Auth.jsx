import React, { useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register, isAuthenticated, loading: authLoading } = useAuth()

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/trips" replace />
  }

  const [isRegister, setIsRegister] = useState(searchParams.get('register') === '1')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(name, email, password)
      } else {
        await login(email, password)
      }
      navigate('/trips', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </div>
      <div className="card auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 5.5C19 7 20 9 20 12c0 3-1 5-2.5 6.5" />
              <path d="M6.5 5.5C5 7 4 9 4 12c0 3 1 5 2.5 6.5" />
              <path d="M9 5c0-1.7 1.3-3 3-3s3 1.3 3 3v14c0 1.7-1.3 3-3 3s-3-1.3-3-3V5z" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <h1>{isRegister ? 'Create an account' : 'Welcome back'}</h1>
          <p>{isRegister ? 'Start splitting expenses with friends' : 'Sign in to your account'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label htmlFor="name">Full name</label>
              <input id="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required autoFocus={isRegister} />
            </div>
          )}
          <div>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus={!isRegister} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a onClick={e => { e.preventDefault(); setIsRegister(!isRegister) }}>
            {isRegister ? 'Sign in' : 'Create one'}
          </a>
        </div>
      </div>
    </div>
  )
}
