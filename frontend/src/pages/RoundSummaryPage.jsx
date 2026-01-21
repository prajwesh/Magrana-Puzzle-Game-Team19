import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/GamePage.css'

function RoundSummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    anchorWord = '',
    roundScore = 0,
    totalScore = 0,
    totalTimeSpent = 0,
    tasksCompleted = 0,
  } = location.state || {}

  const handleNextRound = () => {
    navigate('/game', {
      state: {
        totalScore,
        totalTimeSpent,
        tasksCompleted,
      },
      replace: true,
    })
  }

  const handleExit = () => {
    navigate('/exit-summary', {
      state: { totalScore, totalTimeSpent, tasksCompleted },
      replace: true,
    })
  }

  const handleShare = async () => {
    try {
      const shareText = `🎮 I just scored ${roundScore.toFixed(1)} points on Magrana! 🏆\n\nTotal Score: ${totalScore.toFixed(1)}\nTasks Completed: ${tasksCompleted}\n\nCan you beat my score? Play Magrana now! 🎯`

      const gameBoard = document.querySelector('.game-board')
      
      if (navigator.share) {
        if (window.html2canvas) {
          try {
            const canvas = await window.html2canvas(gameBoard, {
              backgroundColor: '#ffffff',
              scale: 2,
            })
            
            canvas.toBlob(async (blob) => {
              const file = new File([blob], 'magrana-score.png', { type: 'image/png' })
              
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
        alert('Score copied to clipboard! Share it with your friends.')
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
          <h1 className="game-heading">Congratulations!</h1>
          <p className="game-subtitle">You solved the round.</p>
        </div>
        <div className="game-score-panel">
          <span className="label">Total Score</span>
          <span className="score-value">{totalScore.toFixed(1)}</span>
        </div>
      </header>

      <main className="game-board board-success">
        <h2 className="section-title">Round Summary</h2>
        <p className="helper-text">
          Anchor word: <strong>{anchorWord}</strong>
        </p>
        <p className="helper-text">
          This round score: <strong>{roundScore.toFixed(1)}</strong>
        </p>
        <p className="helper-text">
          Tasks completed: <strong>{tasksCompleted}</strong>
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
            className="btn-ghost"
            onClick={handleExit}
          >
            Exit
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleNextRound}
          >
            Next Round
          </button>
        </div>
      </footer>
    </div>
  )
}

export default RoundSummaryPage
