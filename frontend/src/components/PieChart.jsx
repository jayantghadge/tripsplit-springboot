import React from 'react'

export default function PieChart({ data, size = 200 }) {
  if (!data || data.length === 0) return null

  const total = data.reduce((s, d) => s + Number(d.amount), 0)
  if (total === 0) return null

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10
  let currentAngle = -90

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  }

  const slices = data.map(d => {
    const angle = (Number(d.amount) / total) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return { ...d, path: describeArc(startAngle, currentAngle), startAngle, endAngle: currentAngle }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />
      ))}
    </svg>
  )
}
