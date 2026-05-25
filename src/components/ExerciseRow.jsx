import React from 'react'
import { TAG_META } from '../data.js'

export default function ExerciseRow({ exercise, sessionData, prefillWeight, onChange, onSetComplete }) {
  const tag = TAG_META[exercise.tag] || TAG_META.machine
  const isAssisted = exercise.tag === 'assisted'

  const weight   = sessionData?.weight ?? prefillWeight ?? ''
  const reps     = sessionData?.reps   ?? exercise.reps.toString()
  const doneSets = sessionData?.doneSets || 0

  const isPrefilled = !sessionData?.weight && !!prefillWeight

  function update(patch) {
    onChange({ doneSets, weight, reps, ...sessionData, ...patch })
  }

  function toggleDot(i) {
    const next = i < doneSets ? i : i + 1
    const wasIncrement = next > doneSets
    update({ doneSets: next })
    if (wasIncrement) onSetComplete()
  }

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={{ flex: 1 }}>
          <div style={styles.name}>{exercise.name}</div>
          <div style={styles.note}>{exercise.note}</div>
        </div>
        <div style={styles.badges}>
          <span style={{ ...styles.setsRepsLabel }}>{exercise.sets}×{exercise.reps}</span>
          <span style={{ ...styles.tag, color: tag.color, background: tag.bg }}>{tag.label}</span>
        </div>
      </div>

      <div style={styles.inputsRow}>
        {/* Sets */}
        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>Sets</div>
          <div style={styles.dots}>
            {Array.from({ length: exercise.sets }).map((_, i) => (
              <button
                key={i}
                onClick={() => toggleDot(i)}
                style={{
                  ...styles.dot,
                  background: i < doneSets ? tag.color : 'var(--surface)',
                  borderColor: i < doneSets ? tag.color : 'var(--border2)',
                  color: i < doneSets ? '#fff' : 'var(--muted)',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div style={styles.setsSub}>{doneSets}/{exercise.sets} done</div>
        </div>

        {/* Reps */}
        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>Reps</div>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={e => update({ reps: e.target.value })}
            style={styles.numInput}
          />
        </div>

        {/* Weight / Assistance */}
        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>{isAssisted ? 'Assistance (lbs)' : 'Weight (lbs)'}</div>
          <input
            type="number"
            inputMode="decimal"
            step={isAssisted ? 5 : 2.5}
            value={weight}
            onChange={e => update({ weight: e.target.value })}
            placeholder="0"
            style={{
              ...styles.numInput,
              borderColor: isPrefilled ? tag.color : 'var(--border2)',
              background: isPrefilled ? tag.bg : 'var(--surface)',
            }}
          />
          <div style={styles.prefillHint}>
            {prefillWeight
              ? <span style={{ color: 'var(--muted)' }}>
                  Last: <strong style={{ color: tag.color }}>{prefillWeight} lbs</strong>
                  {isAssisted ? ' assistance' : ''}
                </span>
              : <span style={{ color: 'var(--muted2)' }}>First session</span>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '0.75rem', boxShadow: 'var(--shadow)',
  },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '1rem' },
  name: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1.2 },
  note: { fontSize: '0.75rem', color: 'var(--muted)', marginTop: '3px', lineHeight: 1.4 },
  badges: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 },
  setsRepsLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', letterSpacing: '0.05em' },
  tag: { fontSize: '0.58rem', letterSpacing: '0.08em', padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase', fontWeight: 600 },
  inputsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 },
  dots: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  dot: {
    width: '34px', height: '34px', borderRadius: '8px', border: '1.5px solid',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s', flexShrink: 0, cursor: 'pointer',
  },
  setsSub: { fontSize: '0.62rem', color: 'var(--muted)' },
  numInput: {
    width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border2)',
    borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)',
    fontWeight: 700, fontSize: '1.4rem', textAlign: 'center', padding: '8px 4px',
    outline: 'none', transition: 'border-color 0.15s, background 0.15s',
  },
  prefillHint: { fontSize: '0.63rem', lineHeight: 1.4 },
}
