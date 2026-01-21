// src/pages/GamePage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/GamePage.css'

const FALLBACK_ROUND_TIME = 60

function shuffleWord(word) {
  const letters = word.split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }
  return letters.join('')
}

function GamePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    totalScore = 0,
    totalTimeSpent = 0,
    tasksCompleted = 0,
  } = location.state || {}

  const [anchorWord, setAnchorWord] = useState(null)
  const [roundTime, setRoundTime] = useState(FALLBACK_ROUND_TIME)

  const [tiles, setTiles] = useState([])
  const [dragIndex, setDragIndex] = useState(null)

  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [roundCompleted, setRoundCompleted] = useState(false)
  const [roundSuccess, setRoundSuccess] = useState(false)
  const [roundScore, setRoundScore] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const correctLetters = useMemo(
    () => (anchorWord ? anchorWord.split('') : []),
    [anchorWord]
  )

  // fetch anchor word from Django API
  useEffect(() => {
    const fetchNextWord = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch('http://127.0.0.1:8000/api/vocab/next/')

        if (!res.ok) {
          throw new Error(`Failed to load word (${res.status})`)
        }

        const data = await res.json()
        const word = (data.anchor_word || '').toUpperCase()
        const duration = data.round_time_seconds || FALLBACK_ROUND_TIME

        setAnchorWord(word)
        setRoundTime(duration)

        const scrambled = shuffleWord(word)
        setTiles(scrambled.split(''))
        setTimeLeft(duration)
        setIsRunning(true)
        setRoundCompleted(false)
        setRoundSuccess(false)
        setRoundScore(0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNextWord()
  }, [])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0 || roundCompleted) return

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft, roundCompleted])

  const handleTimeUp = () => {
    if (roundCompleted) return
    setIsRunning(false)
    setRoundCompleted(true)
    setRoundSuccess(false)
  }

  const handleDragStart = (index) => {
    if (roundCompleted) return
    setDragIndex(index)
  }

  const handleDragOver = (event, targetIndex) => {
    event.preventDefault()
    if (dragIndex === null || dragIndex === targetIndex || roundCompleted) return

    const updated = [...tiles]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(targetIndex, 0, moved)
    setTiles(updated)
    setDragIndex(targetIndex)
  }

  const handleDrop = () => {
    if (roundCompleted) return
    setDragIndex(null)
    checkIfSolved()
  }

  const checkIfSolved = () => {
    if (!anchorWord) return

    const currentWord = tiles.join('')
    const target = correctLetters.join('')
    if (currentWord === target && !roundCompleted) {
      const base = 1
      const bonus = timeLeft * 0.1
      const achieved = parseFloat((base + bonus).toFixed(1))

      setRoundScore(achieved)
      setIsRunning(false)
      setRoundCompleted(true)
      setRoundSuccess(true)

      const newTotalScore = parseFloat((totalScore + achieved).toFixed(1))
      const timeUsed = roundTime - timeLeft
      const newTotalTime = totalTimeSpent + timeUsed
      const newTasksCompleted = tasksCompleted + 1

      navigate('/round-summary', {
        state: {
          anchorWord,
          roundScore: achieved,
          totalScore: newTotalScore,
          totalTimeSpent: newTotalTime,
          tasksCompleted: newTasksCompleted,
        },
        replace: true,
      })
    }
  }

  const handleTryAgain = () => {
    if (!anchorWord) return
    const scrambled = shuffleWord(anchorWord)
    setTiles(scrambled.split(''))
    setTimeLeft(roundTime)
    setIsRunning(true)
    setRoundCompleted(false)
    setRoundSuccess(false)
    setRoundScore(0)
  }

  const handleExit = () => {
    const timeUsed = roundTime - timeLeft
    const newTotalTime = totalTimeSpent + timeUsed
    const newTasksCompleted = roundSuccess ? tasksCompleted + 1 : tasksCompleted
    const newTotalScore = totalScore + (roundSuccess ? roundScore : 0)

    navigate('/exit-summary', {
      state: {
        totalScore: parseFloat(newTotalScore.toFixed(1)),
        totalTimeSpent: newTotalTime,
        tasksCompleted: newTasksCompleted,
      },
      replace: true,
    })
  }

  if (loading) {
    return (
      <div className="game-container">
        <p className="helper-text">Loading word…</p>
      </div>
    )
  }

  if (error || !anchorWord) {
    return (
      <div className="game-container">
        <p className="helper-error">
          Could not load word. {error || 'Please try again later.'}
        </p>
      </div>
    )
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="game-title-block">
          <h1 className="game-heading">Magrana</h1>
          <p className="game-subtitle">Puzzle Game</p>
        </div>
        <div className="game-score-panel">
          <span className="label">Score</span>
          <span className="score-value">{totalScore.toFixed(1)}</span>
        </div>
      </header>

      <section className="game-status-row">
        <div className="timer-box">
          <span className="label">Time Left</span>
          <span className={`timer-value ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="round-info">
          <span className="label">Anchor Word Length</span>
          <span className="round-value">{correctLetters.length} letters</span>
        </div>
      </section>

      <main
        className={
          'game-board ' +
          (roundCompleted
            ? roundSuccess
              ? 'board-success'
              : 'board-error'
            : '')
        }
      >
        <h2 className="section-title">
          Arrange the letters in the correct order
        </h2>
        <div className="tiles-row">
          {tiles.map((letter, index) => (
            <div
              key={`${letter}-${index}`}
              className="letter-tile"
              draggable={!roundCompleted}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
            >
              {letter}
            </div>
          ))}
        </div>
        {!roundCompleted && (
          <p className="helper-text">
            Drag and drop the tiles. Finish before the timer ends.
          </p>
        )}
        {roundCompleted && !roundSuccess && (
          <p className="helper-text helper-error">
            Time is up. Try arranging the same word again.
          </p>
        )}
      </main>

      <footer className="game-footer">
        <div />
        <div className="footer-actions-right">
          {roundCompleted && !roundSuccess && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleTryAgain}
            >
              Try again
            </button>
          )}
          <button
            type="button"
            className="btn-ghost"
            onClick={handleExit}
          >
            Exit
          </button>
        </div>
      </footer>
    </div>
  )
}

export default GamePage
