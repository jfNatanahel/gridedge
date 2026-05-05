import React from 'react'

type Row = { iter: number; normP: number; normQ: number; time_us: number }

export default function ConvergenceTable({ rows = [] as Row[] }) {
  const sample = rows.length ? rows : [
    { iter: 0, normP: 1.23, normQ: 0.12, time_us: 420 },
    { iter: 1, normP: 0.12, normQ: 0.03, time_us: 315 }
  ]

  return (
    <div style={{ marginTop: 12 }}>
      <h4>Convergencia</h4>
      <table style={{ width: '100%', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#94A3B8' }}>
            <th>k</th>
            <th>||ΔP||</th>
            <th>||ΔQ||</th>
            <th>µs</th>
          </tr>
        </thead>
        <tbody>
          {sample.map((r) => (
            <tr key={r.iter}>
              <td>{r.iter}</td>
              <td>{r.normP.toExponential(2)}</td>
              <td>{r.normQ.toExponential(2)}</td>
              <td>{r.time_us}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
