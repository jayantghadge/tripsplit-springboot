import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go home
          </button>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
