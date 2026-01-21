//GAME PAGE

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/GamePage.css'

const ROUND_TIME_SECONDS = 60 // configurable X seconds

// Utility to scramble word (simple shuffle)
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

  // For now, using a single anchor word.
  // Later this can come from backend via REST API.
  const [anchorWord, setAnchorWord] = useState('MAGRANA')
  const [tiles, setTiles] = useState([])
  const [dragIndex, setDragIndex] = useState(null)

  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS)
  const [isRunning, setIsRunning] = useState(true)

  const [score, setScore] = useState(0)
  const [roundCompleted, setRoundCompleted] = useState(false)
  const [roundResultMessage, setRoundResultMessage] = useState('')

  // Derived correct arrangement
  const correctLetters = useMemo(() => anchorWord.split(''), [anchorWord])

  // Initialize tiles with scrambled letters
  useEffect(() => {
    const scrambled = shuffleWord(anchorWord)
    setTiles(scrambled.split(''))
    setTimeLeft(ROUND_TIME_SECONDS)
    setIsRunning(true)
    setRoundCompleted(false)
    setRoundResultMessage('')
  }, [anchorWord])

  // Countdown timer
  useEffect(() => {
    if (!isRunning || timeLeft <= 0 || roundCompleted) return

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft, roundCompleted])

  const handleTimeUp = () => {
    if (roundCompleted) return
    setRoundCompleted(true)
    setRoundResultMessage('Time is up! Round over.')
  }

  const handleDragStart = (index) => {
    setDragIndex(index)
  }

  const handleDragOver = (event, targetIndex) => {
    event.preventDefault()
    // Dynamic re‑ordering of surrounding letters
    if (dragIndex === null || dragIndex === targetIndex) return

    const updatedTiles = [...tiles]
    const [moved] = updatedTiles.splice(dragIndex, 1)
    updatedTiles.splice(targetIndex, 0, moved)
    setTiles(updatedTiles)
    setDragIndex(targetIndex)
  }

  const handleDrop = () => {
    setDragIndex(null)
    checkIfSolved()
  }

  const checkIfSolved = () => {
    const currentWord = tiles.join('')
    const target = correctLetters.join('')
    if (currentWord === target && !roundCompleted) {
      const baseScore = 1
      const bonus = timeLeft * 0.1
      const roundScore = parseFloat((baseScore + bonus).toFixed(1))
      setScore((prev) => parseFloat((prev + roundScore).toFixed(1)))
      setIsRunning(false)
      setRoundCompleted(true)
      setRoundResultMessage(
        `Correct! You earned ${roundScore} points this round.`
      )
    }
  }

  const handleNextRound = () => {
    // In a full implementation, fetch the next anchor word via API.
    // For now, just toggle between a couple of sample words.
    setAnchorWord((prev) => (prev === 'MAGRANA' ? 'PUZZLE' : 'MAGRANA'))
  }

  const handleExit = () => {
    navigate('/') // go back to home / welcome page
  }

  const handleShare = () => {
    // Share feature: only share a “success” picture / message, not letters.
    // This is a placeholder hook where you can integrate HTML2Canvas or Web Share API.
    alert('Share feature will capture your success without revealing letters.')
  }

  return (
    <div className="game-container">
      {/* Header: title + score *//*}
      <header className="game-header">
        <div className="game-title-block">
          <h1 className="game-heading">Magrana</h1>
          <p className="game-subtitle">Puzzle Game</p>
        </div>
        <div className="game-score-panel">
          <span className="label">Score</span>
          <span className="score-value">{score.toFixed(1)}</span>
        </div>
      </header>

      {/* Status row: timer + current word info */}
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

      {/* Letter tiles area */}
      <main className="game-board">
        <h2 className="section-title">Arrange the letters in the correct order</h2>
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
        <p className="helper-text">
          Drag and drop the tiles until they match the original anchor word.
        </p>
      </main>

      {/* Result / feedback message */}
      {roundResultMessage && (
        <div className="result-banner">
          {roundResultMessage}
        </div>
      )}

      {/* Bottom actions: Share + Next / Exit */}
      <footer className="game-footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleShare}
          disabled={!roundCompleted}
        >
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

export default GamePage


//GAME PAGE

# hackathon/views_vocab.py
from django.http import JsonResponse
from django.db import connections
import random


def next_vocab_word(request):
    with connections["student"].cursor() as cursor:
        cursor.execute(
            """
            SELECT anchor_word
            FROM vocab_words
            WHERE LENGTH(anchor_word) > 4
            ORDER BY RAND()
            LIMIT 1;

            """
        )
        row = cursor.fetchone()

    if not row:
        return JsonResponse({"detail": "No words found"}, status=404)

    anchor_word = row[0]

    return JsonResponse(
        {
            "anchor_word": anchor_word,
            "round_time_seconds": 60,
        }
    )
