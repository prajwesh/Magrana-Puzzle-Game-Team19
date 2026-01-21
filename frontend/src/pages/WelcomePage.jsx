import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/WelcomePage.css'

function WelcomePage() {
  const navigate = useNavigate()
  const { user, member, signOut } = useAuth()

  const handlePlay = () => {
    navigate('/game')
  }

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  const displayName = member?.name || user?.username || 'Player'
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <div className="welcome-container">
      {/* small fixed top bar */}
      <div className="welcome-topbar">
        <div className="welcome-topbar-right">
          <div className="welcome-avatar-circle" title={displayName}>
            {initial}
          </div>
          <button
            type="button"
            className="btn-logout-small"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="welcome-content">
        <h1 className="welcome-heading">
          Welcome, {displayName}!
        </h1>

        <h2 className="game-title">Magrana</h2>
        <p className="game-subtitle">Puzzle Game</p>

        <div className="instructions-box">
          <h3 className="instructions-title">How to Play</h3>
          <ul className="instructions-list">
            <li>The game provides a scrambled arrangement of an anchor word</li>
            <li>Each letter appears as a movable tile, similar to Scrabble</li>
            <li>Drag and drop letters to rearrange them in the correct order</li>
            <li>Surrounding letters will dynamically adjust to create space</li>
            <li>Complete the word before time runs out to earn points</li>
            <li>
              <strong>Scoring:</strong> +1 point per word, +0.1 bonus for each
              second saved
            </li>
          </ul>
        </div>

        <button className="btn-play" onClick={handlePlay}>
          Let&apos;s Play
        </button>
      </div>
    </div>
  )
}

export default WelcomePage
