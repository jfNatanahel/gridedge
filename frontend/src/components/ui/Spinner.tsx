import React from 'react'

export default function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" aria-hidden="true">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
