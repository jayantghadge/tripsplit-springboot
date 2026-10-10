import React from 'react'

export function CardSkeleton() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-line skeleton-line-title" />
      <div className="skeleton-line skeleton-line-text" />
      <div className="skeleton-line skeleton-line-text short" />
    </div>
  )
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="card">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-line skeleton-line-text" />
          <div className="skeleton-line skeleton-line-text short" />
        </div>
      ))}
    </div>
  )
}

export function TripDetailSkeleton() {
  return (
    <div className="container">
      <div className="skeleton-nav" />
      <CardSkeleton />
      <CardSkeleton />
      <ListSkeleton />
    </div>
  )
}
