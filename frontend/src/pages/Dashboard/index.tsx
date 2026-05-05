import React, { useEffect } from 'react'
import NetworkMap2D from '../../components/network/NetworkMap2D'
import ConvergenceTable from '../../components/metrics/ConvergenceTable'
import useNetworkStore from '../../store/useNetworkStore'
import Spinner from '../../components/ui/Spinner'
import { postSolve } from '../../services/solveService'
import type { NetworkCase } from '../../types'
import { fmtVoltage, fmtAngle, fmtLoading } from '../../utils/formatters'

type Props = { networkCase: NetworkCase | null; onBack: () => void }

export default function Dashboard({ networkCase, onBack }: Props) {
  const store = useNetworkStore()

  useEffect(() => {
    if (!networkCase) onBack()
  }, [networkCase])

  const handleSolve = async () => {
    if (!networkCase) return
    store.setIsLoading(true)
    try {
      const res = await postSolve(networkCase)
      store.setSolveResult(res)
      store.setSystemStatus(res.converged ? 'stable' : 'warning')
    } catch (e: any) {
      store.setSystemStatus('error')
    } finally {
      store.setIsLoading(false)
    }
  }

  const result = store.solveResult

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 320, padding: 16, borderRight: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onBack}>← Volver</button>
          <h3 style={{ marginLeft: 8 }}>{networkCase?.name}</h3>
        </div>

        <div style={{ color: '#9CA3AF', marginTop: 6 }}>{networkCase?.description}</div>

        <div style={{ marginTop: 12 }}>
          <button onClick={handleSolve} disabled={store.isLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {store.isLoading ? (
              <>
                <Spinner size={14} /> <span>Resolviendo…</span>
              </>
            ) : (
              'Solve'
            )}
          </button>
        </div>

        <ConvergenceTable
          rows={
            result?.conv_iters?.map((it: number, i: number) => ({
              iter: i,
              normP: result.conv_errors?.[i] ?? 0,
              normQ: 0,
              time_us: 0,
            })) ?? []
          }
        />
      </aside>

      <main style={{ flex: 1, padding: 8 }}>
        <NetworkMap2D
          networkCase={networkCase ?? { name: '', buses: [], lines: [] }}
          onSelectBus={(id) => store.setSelectedBusId(id)}
        />
      </main>

      <aside style={{ width: 340, padding: 12, borderLeft: '1px solid rgba(255,255,255,0.03)' }}>
        <h4>Detalles</h4>
        {networkCase ? (
          <div>
            <h5>Buses</h5>
            <table style={{ width: '100%', fontSize: 13 }}>
              <thead style={{ color: '#94A3B8' }}>
                <tr>
                  <th>ID</th>
                  <th>V</th>
                  <th>θ</th>
                  <th>P</th>
                  <th>Q</th>
                </tr>
              </thead>
              <tbody>
                {networkCase.buses.map((b, i) => {
                  const V = result?.V_pu?.[i] ?? b.V_pu ?? b.voltage_pu ?? null
                  const theta = result?.theta_rad?.[i] ?? b.angle_rad ?? b.angle_deg ?? null
                  const P = b.p_mw ?? b.P_load_pu ?? null
                  const Q = b.q_mvar ?? b.Q_load_pu ?? null
                  return (
                    <tr key={b.id}>
                      <td>{b.name ?? b.id}</td>
                      <td>{fmtVoltage(V)}</td>
                      <td>{fmtAngle(theta)}</td>
                      <td>{fmtPowerOrDash(P)}</td>
                      <td>{fmtPowerOrDash(Q)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <h5 style={{ marginTop: 12 }}>Líneas</h5>
            <table style={{ width: '100%', fontSize: 13 }}>
              <thead style={{ color: '#94A3B8' }}>
                <tr>
                  <th>ID</th>
                  <th>From → To</th>
                  <th>R/X</th>
                  <th>Load</th>
                </tr>
              </thead>
              <tbody>
                {networkCase.lines.map((ln) => {
                  const from = (ln.from ?? ln.from_bus) as any
                  const to = (ln.to ?? ln.to_bus) as any
                  const r = ln.R_pu ?? 0
                  const x = ln.X_pu ?? 0
                  const load = ln.loading_pct ?? null
                  return (
                    <tr key={ln.id ?? `${from}-${to}`}>
                      <td>{ln.id}</td>
                      <td>
                        {String(from)} → {String(to)}
                      </td>
                      <td>{`${r.toFixed(3)}/${x.toFixed(3)}`}</td>
                      <td>{load != null ? `${load.toFixed(1)}%` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div>Selecciona un caso para ver detalles.</div>
        )}
      </aside>
    </div>
  )
}

function fmtPowerOrDash(v: number | null | undefined) {
  if (v == null) return '—'
  return `${v}`
}
