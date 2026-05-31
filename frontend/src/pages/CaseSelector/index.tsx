import React, { useEffect, useState } from 'react'
import { getCases, getCase } from '../../services/casesService'
import type { NetworkCase } from '../../types'

const CaseSelector: React.FC<{ onCaseLoaded: (nc: NetworkCase) => void }> = ({ onCaseLoaded }) => {
  const [cases, setCases] = useState<Array<{ name: string; description: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getCases()
      .then((c) => setCases(c))
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false))
  }, [])

  // If developer wants to use a local mock (no backend), check env var
  if ((import.meta.env.VITE_USE_MOCK ?? 'false') === 'true') {
    // lazy-load sample data to avoid importing in prod bundles
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sampleCase } = require('../../mockData')
    if (cases.length === 0) setCases([{ name: sampleCase.name, description: sampleCase.description }])
  }

  const load = async (name: string) => {
    setLoading(true)
    setError(null)
    try {
      const c = await getCase(name)
      onCaseLoaded(c)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="case-selector" style={{ padding: 20 }}>
      <h2>Seleccionar Caso</h2>
      {loading && <p>Cargando casos…</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}
      <ul>
        {cases.map((c) => (
          <li key={c.name} style={{ margin: '8px 0' }}>
            <strong>{c.name}</strong>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>{c.description}</div>
            <button onClick={() => load(c.name)} style={{ marginTop: 6 }}>
              Abrir
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CaseSelector
