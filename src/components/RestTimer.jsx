import React, { useState, useEffect, useRef, useCallback } from 'react'

const REST_SECONDS = 120

export default function RestTimer({ trigger }) {
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [active, setActive] = useState(false)
  const intervalRef = useRef(null)
  const prevTrigger = useRef(trigger)

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setActive(false)
    setSecondsLeft(null)
  }, [])

  const start = useCallback(() => {
    clearInterval(intervalRef.current)
    setSecondsLeft(REST_SECONDS)
    setActive(true)
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setActive(false)
          // Beep on completion
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            const beep = (freq, start, dur) => {
              const o = ctx.createOscillator()
              const g = ctx.createGain()
              o.connect(g); g.connect(ctx.destination)
              o.frequency.value = freq
              o.type = 'sine'
              g.gain.setValueAtTime(0.3, ctx.currentTime + start)
              g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
              o.start(ctx.currentTime + start)
              o.stop(ctx.currentTime + start + dur)
            }
            beep(880, 0, 0.15)
            beep(880, 0.2, 0.15)
            beep(1100, 0.4, 0.3)
          } catch(e) {}
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  // Auto-start when trigger increments (set completed)
  useEffect(() => {
    if (trigger > prevTrigger.current) {
      start()
    }
    prevTrigger.current = trigger
  }, [trigger, start])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  if (!active && secondsLeft === null) return null

  const pct = secondsLeft === null ? 0 : (secondsLeft / REST_SECONDS) * 100
  const mins = Math.floor((secondsLeft || 0) / 60)
  const secs = String((secondsLeft || 0) % 60).padStart(2, '0')
  const done = secondsLeft === 0

  return (
    <div style={{ ...styles.wrap, background: done ? '#e8f5ee' : '#fff8e1', borderColor: done ? 'var(--accent)' : '#f59e0b' }}>
      <div style={styles.left}>
        {/* Circular progress */}
        <div style={styles.ringWrap}>
          <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="#e5e7eb" strokeWidth="4" />
            <circle
              cx="26" cy="26" r="22" fill="none"
              stroke={done ? 'var(--accent)' : '#f59e0b'}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <div style={{ ...styles.ringLabel, color: done ? 'var(--accent)' : '#92400e' }}>
            {done ? '✓' : `${mins}:${secs}`}
          </div>
        </div>
        <div style={styles.timerText}>
          <div style={{ ...styles.timerTitle, color: done ? 'var(--accent)' : '#92400e' }}>
            {done ? 'Rest Complete — Go!' : 'Rest Timer'}
          </div>
          <div style={styles.timerSub}>
            {done ? 'Start your next set' : `${mins}:${secs} remaining`}
          </div>
        </div>
      </div>
      <div style={styles.right}>
        <button onClick={start} style={{ ...styles.timerBtn, background: '#fff8e1', borderColor: '#f59e0b', color: '#92400e' }}>↺ Reset</button>
        <button onClick={stop} style={{ ...styles.timerBtn, background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>✕ Skip</button>
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    margin: '0 1.25rem 0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1.5px solid',
    transition: 'all 0.3s',
  },
  left: { display: 'flex', alignItems: 'center', gap: '10px' },
  ringWrap: { position: 'relative', flexShrink: 0 },
  ringLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  timerText: {},
  timerTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  timerSub: { fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' },
  right: { display: 'flex', gap: '6px', flexShrink: 0 },
  timerBtn: {
    padding: '6px 10px',
    border: '1.5px solid',
    borderRadius: '7px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
}
