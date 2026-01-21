/*import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/landing"
        element={
          <RequireAuth>
            <LandingPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App*/

import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth.jsx'
import ExitSummaryPage from './pages/ExitSummaryPage.jsx'
import GamePage from './pages/GamePage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RoundSummaryPage from './pages/RoundSummaryPage.jsx'
import WelcomePage from './pages/WelcomePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Welcome Page - Main entry after login */}
      <Route
        path="/welcome"
        element={
          <RequireAuth>
            <WelcomePage />
          </RequireAuth>
        }
      />

      {/* Old Landing Page - Keep for now */}
      <Route
        path="/landing"
        element={
          <RequireAuth>
            <LandingPage />
          </RequireAuth>
        }
      />

      {/* Game Page - now using GamePage */}
      <Route
        path="/game"
        element={
          <RequireAuth>
            <GamePage />
          </RequireAuth>
        }
      />

      {/* Round Summary - After clicking the next round */}
      <Route
        path="/round-summary"
        element={
          <RequireAuth>
            <RoundSummaryPage />
          </RequireAuth>
        }
      />

      {/* Exit Summary - After clicking Exit */}
      <Route
        path="/exit-summary"
        element={
          <RequireAuth>
            <ExitSummaryPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
