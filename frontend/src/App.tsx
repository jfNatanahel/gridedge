import { useState } from 'react'
import CaseSelector from './pages/CaseSelector'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [screen, setScreen] = useState('selector')
  const [loadedCase, setLoadedCase] = useState(null)

  const handleCaseLoaded = (networkCase) => {
    setLoadedCase(networkCase)
    setScreen('dashboard')
  }

  const handleBackToSelector = () => setScreen('selector')

  return (
    <div className="app">
      {screen === 'selector' && (
        <CaseSelector onCaseLoaded={handleCaseLoaded} />
      )}
      {screen === 'dashboard' && (
        <Dashboard networkCase={loadedCase} onBack={handleBackToSelector} />
      )}
    </div>
  )
}

export default App
