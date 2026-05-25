import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useFirestore } from './useFirestore.js'
import { getTodayDayType, buildPrefillData } from './workoutLogic.js'
import WorkoutDay from './components/WorkoutDay.jsx'
import CalendarView from './components/CalendarView.jsx'
import { DAYS } from './data.js'

function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function App() {
  const [activeView, setActiveView] = useState('workout')
  const [sessions, setSessions, sessionsLoading] = useFirestore('data', 'sessions', {})
  const [calendar, setCalendar, calendarLoading]  = useFirestore('data', 'calendar', {})

  // Clock
  const [clockStartedAt, setClockStartedAt] = useState(null)
  const [clockAccum, setClockAccum] = useState(0)
  const clockTickRef = useRef(null)
  const [, setTick] = useState(0)

  const clockRunning = clockStartedAt !== null
  const clockElapsed = clockStartedAt
    ? clockAccum + Math.floor((Date.now() - clockStartedAt) / 1000)
    : clockAccum

  useEffect(() => {
    if (clockRunning) {
      clockTickRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      clearInterval(clockTickRef.current)
    }
    return () => clearInterval(clockTickRef.current)
  }, [clockRunning])

  function clockStart() { setClockStartedAt(Date.now() - clockAccum * 1000) }
  function clockPause() { setClockAccum(clockElapsed); setClockStartedAt(null) }
  function clockReset() { setClockStartedAt(null); setClockAccum(0) }

  const todayKey = toDateKey(new Date())

  // Determine day type — if today already started use stored, else auto + allow manual override
  const [manualDayType, setManualDayType] = useState(null)

  const dayType = useMemo(() => {
    if (sessions[todayKey]?._dayType) return sessions[todayKey]._dayType
    if (manualDayType) return manualDayType
    return getTodayDayType(sessions, todayKey)
  }, [sessions, todayKey, manualDayType])

  function swapDayType() {
    // Only allow swap if session hasn't started yet
    if (sessions[todayKey]?._dayType) return
    setManualDayType(d => d ? (d === 'A' ? 'B' : 'A') : (getTodayDayType(sessions, todayKey) === 'A' ? 'B' : 'A'))
  }

  // Lock day type only when at least one set has been marked done
  const sessionStarted = useMemo(() => {
    const s = sessions[todayKey]
    if (!s) return false
    const day = DAYS[s._dayType]
    if (!day) return false
    return day.exercises.some(ex => s[ex.id]?.sets?.some(set => set.done))
  }, [sessions, todayKey])

  // Prefill weights from last same-day-type session
  const prefillData = useMemo(() => {
    return buildPrefillData(sessions, todayKey, dayType)
  }, [sessions, todayKey, dayType])

  const todaySession = sessions[todayKey] || {}

  function handleSessionChange(data) {
    setSessions(s => ({ ...s, [todayKey]: { ...data, _dayType: dayType } }))
  }

  function handleSaveToCalendar() {
    const durationMins = clockElapsed > 0 ? Math.round(clockElapsed / 60) : 60
    setCalendar(c => ({
      ...c,
      [todayKey]: {
        type: dayType,
        types: [dayType],
        durations: { [dayType]: durationMins.toString() },
        duration: durationMins.toString(),
        notes: c[todayKey]?.notes || '',
      }
    }))
    clockReset()
    setActiveView('calendar')
  }

  const loading = sessionsLoading || calendarLoading
  const day = DAYS[dayType]

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', minHeight: '100vh' }}>
      <header style={styles.header}>
        <div style={styles.logo}>EOS <span style={{ color: 'var(--accent)' }}>Training</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Day type pill + swap button */}
          {day && activeView === 'workout' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ ...styles.dayPill, background: day.bg, color: day.color, border: `1px solid ${day.color}55` }}>
                {day.name}
              </div>
              {!sessionStarted && (
                <button
                  onClick={swapDayType}
                  title={`Switch to ${dayType === 'A' ? 'Lower (B)' : 'Upper (A)'}`}
                  style={{ ...styles.swapBtn, color: day.color, borderColor: day.color, background: day.bg }}
                >
                  {dayType === 'A' ? 'B?' : 'A?'}
                </button>
              )}
            </div>
          )}
          <div style={styles.navTabs}>
            <button style={{ ...styles.navTab, ...(activeView === 'workout' ? { ...styles.navActive, background: day?.color || 'var(--accent)' } : {}) }} onClick={() => setActiveView('workout')}>
              Workout
            </button>
            <button style={{ ...styles.navTab, ...(activeView === 'calendar' ? { ...styles.navActive, background: day?.color || 'var(--accent)' } : {}) }} onClick={() => setActiveView('calendar')}>
              Calendar
            </button>
          </div>
        </div>
      </header>

      {loading && (
        <div style={styles.loadingBar}>
          <div style={{ ...styles.loadingPulse, background: day?.color || 'var(--accent)' }} />
        </div>
      )}

      <div style={{ display: activeView === 'workout' ? 'block' : 'none' }}>
        <WorkoutDay
          dayType={dayType}
          todaySession={todaySession}
          prefillData={prefillData}
          onSessionChange={handleSessionChange}
          onSaveToCalendar={handleSaveToCalendar}
          clockRunning={clockRunning}
          clockElapsed={clockElapsed}
          onClockStart={clockStart}
          onClockPause={clockPause}
          onClockReset={clockReset}
        />
      </div>

      <div style={{ display: activeView === 'calendar' ? 'block' : 'none' }}>
        <CalendarView
          calendarData={calendar}
          sessions={sessions}
          onCalendarChange={setCalendar}
        />
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 100, boxShadow: 'var(--shadow)',
  },
  logo: {
    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem',
    textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, color: 'var(--text)',
  },
  dayPill: {
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem',
    letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px',
    borderRadius: '20px',
  },
  navTabs: {
    display: 'flex', gap: '4px', background: 'var(--surface2)',
    padding: '4px', borderRadius: '10px', border: '1px solid var(--border)',
  },
  navTab: {
    padding: '7px 13px', border: 'none', background: 'transparent', color: 'var(--muted)',
    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem',
    letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '7px',
    transition: 'all 0.15s', cursor: 'pointer',
  },
  navActive: { color: '#fff', boxShadow: 'var(--shadow)' },
  swapBtn: {
    height: '28px', padding: '0 8px', borderRadius: '6px', border: '1.5px solid',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem',
    letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0, textTransform: 'uppercase',
  },
  loadingPulse: { height: '100%', width: '30%', borderRadius: '2px' },
}
