import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/GamePage.css'


function ExitSummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    totalScore = 0,
    totalTimeSpent = 0,
    tasksCompleted = 0,
  } = location.state || {}

  const handleBackToWelcome = () => {
    navigate('/welcome', { replace: true })
  }

  const handleSaveAndExit = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 1
      
      // LOG what you're sending
      console.log('Sending:', {
        user_id: userId,
        total_score: totalScore,
        total_time_spent: totalTimeSpent,
        tasks_completed: tasksCompleted,
      })

      const response = await fetch('http://127.0.0.1:8000/api/game-results/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          total_score: totalScore,
          total_time_spent: totalTimeSpent,
          tasks_completed: tasksCompleted,
        }),
      })

      const data = await response.json()
      console.log('Response:', data)

      if (data.success) {
        console.log('✅ Game results saved to database')
        navigate('/welcome', { replace: true })
      } else {
        console.error('Failed to save:', data.message)
        navigate('/welcome', { replace: true })
      }
    } catch (err) {
      console.error('Error:', err)
      navigate('/welcome', { replace: true })
    }
  }

  const handleShare = async () => {
    try {
      const minutes = Math.floor(totalTimeSpent / 60)
      const seconds = totalTimeSpent % 60

      const shareText = `🎮 Session Summary - Magrana 🏆\n\nFinal Score: ${totalScore.toFixed(1)}\nTasks Completed: ${tasksCompleted}\nTime Spent: ${minutes}m ${seconds}s\n\nJoin me and test your word puzzle skills! 🎯`

      const gameBoard = document.querySelector('.game-board')

      if (navigator.share) {
        if (window.html2canvas) {
          try {
            const canvas = await window.html2canvas(gameBoard, {
              backgroundColor: '#ffffff',
              scale: 2,
            })
            
            canvas.toBlob(async (blob) => {
              const file = new File([blob], 'magrana-summary.png', { type: 'image/png' })
              
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                  await navigator.share({
                    title: 'Magrana - Word Puzzle Game',
                    text: shareText,
                    files: [file],
                  })
                } catch (err) {
                  if (err.name !== 'AbortError') {
                    await navigator.share({
                      title: 'Magrana - Word Puzzle Game',
                      text: shareText,
                    })
                  }
                }
              } else {
                await navigator.share({
                  title: 'Magrana - Word Puzzle Game',
                  text: shareText,
                })
              }
            })
          } catch (err) {
            console.error('Screenshot failed:', err)
            await navigator.share({
              title: 'Magrana - Word Puzzle Game',
              text: shareText,
            })
          }
        } else {
          await navigator.share({
            title: 'Magrana - Word Puzzle Game',
            text: shareText,
          })
        }
      } else {
        await navigator.clipboard.writeText(shareText)
        alert('Session summary copied to clipboard! Share it with your friends.')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err)
        alert('Could not share. Try again later.')
      }
    }
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="game-title-block">
          <h1 className="game-heading">Session Summary</h1>
          <p className="game-subtitle">Thanks for playing Magrana.</p>
        </div>
        <div className="game-score-panel">
          <span className="label">Final Score</span>
          <span className="score-value">{totalScore.toFixed(1)}</span>
        </div>
      </header>

      <main className="game-board">
        <h2 className="section-title">Your Performance</h2>
        <p className="helper-text">
          Total time spent: <strong>{totalTimeSpent}s</strong>
        </p>
        <p className="helper-text">
          Tasks completed: <strong>{tasksCompleted}</strong>
        </p>
        <p className="helper-text">
          Final score: <strong>{totalScore.toFixed(1)}</strong>
        </p>
      </main>

      <footer className="game-footer">
        <button
          type="button"
          className="btn-secondary share-btn"
          onClick={handleShare}
        >
          <span className="share-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.59 13.51l6.83 3.98M15.41 10.49l-6.83-3.98" />
            </svg>
          </span>
          Share
        </button>
        <div className="footer-actions-right">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSaveAndExit}
          >
            Back to Home
          </button>
        </div>
      </footer>
    </div>
  )
}

export default ExitSummaryPage