import React from 'react'

export default function PieChart({ data, size = 200 }) {
  if (!data || data.length === 0) return null

  const total = data.reduce((s, d) => s + Number(d.amount), 0)
  if (total === 0) return null

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10

  // A single slice covers the whole pie. An SVG arc with identical
  // start and end points renders nothing, so draw a full circle instead.
  if (data.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        <circle cx={cx} cy={cy} r={r} fill={data[0].color} />
      </svg>
    )
  }

  let currentAngle = -90

  function polarToCartesian(angleDeg) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(startAngle, endAngle) {
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  }

  const slices = data.map(d => {
    const angle = (Number(d.amount) / total) * 360
    const startAngle = currentAngle
    currentAngle += angle
    return { ...d, path: describeArc(startAngle, currentAngle) }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} strokeWidth="2" className="pie-slice" />
      ))}
    </svg>
  )
}
