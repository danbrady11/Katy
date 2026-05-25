import React, { useMemo, useState } from 'react'
import ExerciseRow from './ExerciseRow.jsx'
import FinisherSection from './FinisherSection.jsx'
import RestTimer from './RestTimer.jsx'
import SessionClock from './SessionClock.jsx'
import { DAYS } from '../data.js'

export default function WorkoutDay({ dayType, todaySession, prefillData, onSessionChange, onSaveToCalendar, clockRunning, clockElapsed, onClockStart, onClockPause, onClockReset }) {
  const [restTrigger, setRestTrigger] = useState(0)

  const day = DAYS[dayType]
  if (!day) return null

  const { exercises, finisher, color, bg, label, tip } = day

  const { totalSets, doneSets } = useMemo(() => {
    let total = 0, done = 0
    exercises.forEach(ex => {
      const sets = todaySession?.[ex.id]?.sets ?? prefillData?.[ex.id]?.sets ?? []
      total += ex.sets
      done += sets.filter(s => s.done).length
    })
    return { totalSets: total, doneSets: done }
  }, [todaySession, exercises, prefillData])

  const finisherDone = (todaySession?._finisher?.completedRounds || 0) >= finisher.rounds
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0
  const allDone = pct === 100 && finisherDone

  function handleExChange(exId, data) {
    onSessionChange({ ...todaySession, [exId]: data })
  }

  function handleFinisherChange(data) {
    onSessionChange({ ...todaySession, _finisher: data })
  }

  function handleReset() {
    if (window.confirm('Reset this session? All progress will be cleared.')) {
      onSessionChange({})
      onClockReset()
    }
  }

  // Prefill finisher weight from last session if not yet set
  const finisherDataWithPrefill = todaySession?._finisher
    ? todaySession._finisher
    : { _prefillWeight: prefillData?._finisherWeight || '' }

  return (
    <div style={{ paddingBottom: '2.5rem' }}>
      {/* Hero */}
      <div style={{ ...styles.hero, background: bg, borderColor: color + '55' }}>
        <div>
          <div style={{ ...styles.heroSub, color }}>EOS Gym</div>
          <div style={styles.heroTitle}>{label}</div>
          <div style={styles.heroDesc}>{exercises.length} lifts + finisher</div>
        </div>
        <div style={styles.heroRight}>
          <div style={{ ...styles.statNum, color }}>~60</div>
          <div style={styles.statLbl}>min</div>
        </div>
      </div>

      {/* Progress */}
      <div style={styles.progWrap}>
        <div style={styles.progTop}>
          <span>Session progress</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{pct}% · {doneSets}/{totalSets} sets</span>
        </div>
        <div style={styles.progTrack}>
          <div style={{ ...styles.progFill, width: `${pct}%`, background: color }} />
        </div>
        {doneSets > 0 && !allDone && <div style={styles.autoSave}>✓ Auto-saved</div>}
      </div>

      {/* Session clock */}
      <SessionClock running={clockRunning} elapsed={clockElapsed} onStart={onClockStart} onPause={onClockPause} onReset={onClockReset} />

      {/* Rest timer */}
      <div style={{ marginTop: '0.75rem' }}>
        <RestTimer trigger={restTrigger} />
      </div>

      {/* Main exercises */}
      <div style={styles.exSection}>
        <div style={{ ...styles.sectionLabel, color }}>Main Lifts</div>
        {exercises.map(ex => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            sessionData={todaySession?.[ex.id]}
            prefillSets={prefillData?.[ex.id]?.sets}
            onChange={(data) => handleExChange(ex.id, data)}
            onSetComplete={() => setRestTrigger(t => t + 1)}
          />
        ))}
      </div>

      {/* Finisher */}
      <div style={styles.exSection}>
        <div style={{ ...styles.sectionLabel, color }}>Finisher</div>
        <FinisherSection
          finisher={finisher}
          finisherData={finisherDataWithPrefill}
          onChange={handleFinisherChange}
          accentColor={color}
          accentBg={bg}
        />
      </div>

      {allDone && <div style={{ ...styles.doneBanner, background: bg, border: `1px solid ${color}`, color }}>🎉 Session Complete — Crush it!</div>}

      {doneSets > 0 && (
        <button style={{ ...styles.saveBtn, background: allDone ? color : 'var(--surface)', color: allDone ? '#fff' : color, border: `2px solid ${color}` }} onClick={onSaveToCalendar}>
          {allDone ? '✓ Save Session to Calendar' : 'Save Progress to Calendar'}
        </button>
      )}

      <button style={styles.resetBtn} onClick={handleReset}>Reset Session</button>

      <div style={{ ...styles.tip, borderColor: color, background: bg }}>
        <strong style={{ ...styles.tipLabel, color }}>Progression</strong>
        {tip}
      </div>
    </div>
  )
}

const styles = {
  hero: { padding: '1.5rem', borderBottom: '1px solid', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroSub: { fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' },
  heroTitle: { fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', textTransform: 'uppercase', lineHeight: 1, color: 'var(--text)' },
  heroDesc: { fontSize: '0.78rem', color: 'var(--muted)', marginTop: '5px' },
  heroRight: { textAlign: 'right', flexShrink: 0 },
  statNum: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', lineHeight: 1 },
  statLbl: { fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' },
  progWrap: { padding: '1rem 1.5rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' },
  progTop: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '8px' },
  progTrack: { height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  autoSave: { fontSize: '0.65rem', color: 'var(--accent)', marginTop: '6px', fontWeight: 500 },
  exSection: { padding: '0.75rem 1.25rem 0' },
  sectionLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)' },
  doneBanner: { margin: '0.75rem 1.25rem 0', padding: '1rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase', textAlign: 'center', borderRadius: 'var(--radius)' },
  saveBtn: { display: 'block', margin: '0.75rem 1.25rem 0', padding: '1rem', width: 'calc(100% - 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 'var(--radius)', transition: 'all 0.2s', boxShadow: 'var(--shadow)', cursor: 'pointer' },
  resetBtn: { display: 'block', margin: '0.5rem 1.25rem 0', padding: '0.85rem', width: 'calc(100% - 2.5rem)', background: 'transparent', border: '1.5px solid var(--border2)', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 'var(--radius)', cursor: 'pointer' },
  tip: { margin: '1rem 1.25rem 0', padding: '0.9rem 1rem', borderLeft: '3px solid', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6 },
  tipLabel: { display: 'block', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 },
}
