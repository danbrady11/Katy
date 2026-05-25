import React from 'react'
import { TAG_META } from '../data.js'

export default function ExerciseRow({ exercise, sessionData, prefillSets, onChange, onSetComplete }) {
  const tag = TAG_META[exercise.tag] || TAG_META.machine
  const isAssisted = exercise.tag === 'assisted'

  // Use saved sets if available, otherwise use prefill
  const sets = sessionData?.sets ?? prefillSets ?? []

  function updateSet(i, patch) {
    const newSets = sets.map((s, idx) => idx === i ? { ...s, ...patch } : s)
    const wasDone = sets[i]?.done
    const nowDone = patch.done !== undefined ? patch.done : sets[i]?.done
    onChange({ ...sessionData, sets: newSets })
    if (!wasDone && nowDone) onSetComplete()
  }

  function toggleDone(i) {
    updateSet(i, { done: !sets[i]?.done })
  }

  // "add weight next time" — applies to all sets (stored on set 0 for simplicity)
  const addWeightNext = sets[0]?.addWeightNext || false
  function toggleAddWeight() {
    const newSets = sets.map(s => ({ ...s, addWeightNext: !addWeightNext }))
    onChange({ ...sessionData, sets: newSets })
  }

  const doneSets = sets.filter(s => s.done).length
  const progressionLabel = isAssisted ? 'Reduce assistance next time' : 'Add weight next time'
  const progressionAmount = isAssisted ? '−5 lbs' : (exercise.id === 'leg-press' || exercise.id === 'step-ups' ? '+10 lbs' : '+5 lbs')

  // Last session weight for hint (first set of prefill)
  const lastWeight = prefillSets?.[0]?.weight

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.topRow}>
        <div style={{ flex: 1 }}>
          <div style={styles.name}>{exercise.name}</div>
          <div style={styles.note}>{exercise.note}</div>
        </div>
        <div style={styles.badges}>
          <span style={styles.setsRepsLabel}>{exercise.sets}×{exercise.reps}</span>
          <span style={{ ...styles.tag, color: tag.color, background: tag.bg }}>{tag.label}</span>
        </div>
      </div>

      {/* Column headers */}
      <div style={styles.colHeaders}>
        <div style={styles.colNum} />
        <div style={styles.colLabel}>Reps</div>
        <div style={styles.colLabel}>{isAssisted ? 'Assistance' : 'Weight'} (lbs)</div>
        <div style={styles.colCheck} />
      </div>

      {/* Per-set rows */}
      {sets.map((set, i) => {
        const isPrefilled = !sessionData?.sets && !!set.weight
        return (
          <div key={i} style={{ ...styles.setRow, background: set.done ? 'var(--accent-light)' : 'var(--surface)', opacity: set.done ? 0.85 : 1 }}>
            {/* Set number */}
            <div style={{ ...styles.setNum, color: set.done ? 'var(--accent)' : 'var(--muted)' }}>{i + 1}</div>

            {/* Reps input */}
            <input
              type="number"
              inputMode="numeric"
              value={set.reps}
              onChange={e => updateSet(i, { reps: e.target.value })}
              style={{
                ...styles.setInput,
                color: set.done ? 'var(--accent)' : 'var(--text)',
                borderColor: set.done ? 'var(--accent)' : 'var(--border2)',
              }}
            />

            {/* Weight input */}
            <input
              type="number"
              inputMode="decimal"
              step={isAssisted ? 5 : 2.5}
              value={set.weight}
              placeholder="0"
              onChange={e => updateSet(i, { weight: e.target.value })}
              style={{
                ...styles.setInput,
                color: set.done ? 'var(--accent)' : 'var(--text)',
                borderColor: set.done ? 'var(--accent)' : isPrefilled ? tag.color : 'var(--border2)',
                background: isPrefilled && !set.done ? tag.bg : 'transparent',
              }}
            />

            {/* Done checkbox */}
            <button
              onClick={() => toggleDone(i)}
              style={{
                ...styles.checkBtn,
                background: set.done ? 'var(--accent)' : 'var(--surface)',
                borderColor: set.done ? 'var(--accent)' : 'var(--border2)',
              }}
              aria-label={set.done ? 'Undo set' : 'Complete set'}
            >
              {set.done && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        )
      })}

      {/* Progress + last weight hint */}
      <div style={styles.footer}>
        <div style={styles.progress}>
          <div style={{ ...styles.progressFill, width: `${sets.length > 0 ? (doneSets / sets.length) * 100 : 0}%`, background: tag.color }} />
        </div>
        <div style={styles.footerRight}>
          <span style={styles.doneLabel}>{doneSets}/{sets.length} sets</span>
          {lastWeight && (
            <span style={styles.lastWeight}>Last: <strong>{lastWeight} lbs</strong></span>
          )}
        </div>
      </div>

      {/* Add weight next time */}
      <button
        onClick={toggleAddWeight}
        style={{
          ...styles.addWeightBtn,
          background: addWeightNext ? tag.bg : 'var(--surface2)',
          borderColor: addWeightNext ? tag.color : 'var(--border)',
          color: addWeightNext ? tag.color : 'var(--muted)',
        }}
      >
        <div style={{
          ...styles.addWeightDot,
          background: addWeightNext ? tag.color : 'var(--border2)',
        }} />
        {progressionLabel}
        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.75rem' }}>
          {addWeightNext ? progressionAmount : ''}
        </span>
      </button>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '0.75rem', boxShadow: 'var(--shadow)',
  },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '0.75rem' },
  name: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1.2 },
  note: { fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.4 },
  badges: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 },
  setsRepsLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', letterSpacing: '0.05em' },
  tag: { fontSize: '0.58rem', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', fontWeight: 600 },

  colHeaders: {
    display: 'grid',
    gridTemplateColumns: '28px 1fr 1fr 44px',
    gap: '6px',
    paddingBottom: '4px',
    marginBottom: '4px',
    borderBottom: '1px solid var(--border)',
  },
  colNum: {},
  colLabel: { fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, textAlign: 'center' },
  colCheck: {},

  setRow: {
    display: 'grid',
    gridTemplateColumns: '28px 1fr 1fr 44px',
    gap: '6px',
    alignItems: 'center',
    padding: '5px 6px',
    borderRadius: '8px',
    marginBottom: '4px',
    transition: 'background 0.15s',
  },
  setNum: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '1rem',
    textAlign: 'center',
    transition: 'color 0.15s',
  },
  setInput: {
    width: '100%',
    background: 'transparent',
    border: '1.5px solid',
    borderRadius: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '1.25rem',
    textAlign: 'center',
    padding: '8px 2px',
    outline: 'none',
    transition: 'all 0.15s',
    minWidth: 0,
  },
  checkBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
  },

  footer: {
    marginTop: '8px',
    marginBottom: '8px',
  },
  progress: {
    height: '3px',
    background: 'var(--border)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '5px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  footerRight: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doneLabel: { fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 500 },
  lastWeight: { fontSize: '0.65rem', color: 'var(--muted)' },

  addWeightBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.6rem 0.75rem',
    border: '1.5px solid',
    borderRadius: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  addWeightDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.15s',
  },
}
