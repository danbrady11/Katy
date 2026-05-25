import React from 'react'

// State lives in App — this is pure display
export default function SessionClock({ running, elapsed, onStart, onPause, onReset }) {
  const hrs  = Math.floor(elapsed / 3600)
  const mins = Math.floor((elapsed % 3600) / 60)
  const secs = elapsed % 60
  const display = hrs > 0
    ? `${hrs}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
    : `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`

  return (
    <div style={styles.wrap}>
      <div style={styles.left}>
        <div style={{ ...styles.dot, background: running ? '#22c55e' : '#d1d5db' }} />
        <div>
          <div style={styles.label}>Session Clock</div>
          <div style={styles.time}>{display}</div>
        </div>
      </div>
      <div style={styles.btns}>
        {!running ? (
          <button style={{ ...styles.btn, background: 'var(--accent)', color: '#fff', border: 'none' }} onClick={onStart}>
            {elapsed === 0 ? '▶ Start' : '▶ Resume'}
          </button>
        ) : (
          <button style={{ ...styles.btn, background: '#fff', color: '#374151', border: '1.5px solid #d1d5db' }} onClick={onPause}>
            ⏸ Pause
          </button>
        )}
        {elapsed > 0 && (
          <button style={{ ...styles.btn, background: '#fee2e2', color: '#991b1b', border: '1.5px solid #fca5a5' }} onClick={onReset}>
            ✕
          </button>
        )}
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
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    margin: '0.75rem 1.25rem 0',
    boxShadow: 'var(--shadow)',
  },
  left: { display: 'flex', alignItems: 'center', gap: '10px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s' },
  label: { fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 },
  time: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.1, color: 'var(--text)', letterSpacing: '0.05em' },
  btns: { display: 'flex', gap: '6px' },
  btn: { padding: '7px 14px', borderRadius: '8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em', whiteSpace: 'nowrap', cursor: 'pointer' },
}
