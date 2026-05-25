import React, { useState, useMemo } from 'react'
import { ALL_CALENDAR_TYPES, DAYS } from '../data.js'

function typeInfo(typeId) {
  return ALL_CALENDAR_TYPES.find(t => t.id === typeId) || { label: typeId, color: 'var(--muted)', bg: 'var(--surface2)' }
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toDateKey(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}
function formatDate(key) {
  if (!key) return ''
  const [y, m, d] = key.split('-')
  return `${MONTHS[parseInt(m)-1]} ${parseInt(d)}, ${y}`
}
function fmtMins(mins) {
  if (!mins) return '—'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins/60), m = mins%60
  return m ? `${h}h ${m}m` : `${h}h`
}

const LIFT_DEFAULT = 60

function getWeekKey(dateKey) {
  const d = new Date(dateKey + 'T12:00:00')
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  const mon = new Date(d); mon.setDate(d.getDate() + diff)
  return mon.toISOString().slice(0,10)
}

function SessionDetail({ dayType, sessionData }) {
  if (!sessionData) return null
  const day = DAYS[dayType]
  if (!day) return null
  return (
    <div style={sd.wrap}>
      {day.exercises.map(ex => {
        const exData = sessionData[ex.id]
        if (!exData?.sets) return null
        const doneSets = exData.sets.filter(s => s.done)
        if (doneSets.length === 0) return null
        // Show each completed set
        return (
          <div key={ex.id} style={sd.exBlock}>
            <div style={sd.name}>{ex.name}</div>
            <div style={sd.setsList}>
              {doneSets.map((s, i) => (
                <span key={i} style={sd.badge}>{s.reps} × {s.weight || '?'} lbs</span>
              ))}
            </div>
          </div>
        )
      })}
      {sessionData._finisher?.completedRounds > 0 && (
        <div style={{ ...sd.exBlock, borderBottom: 'none' }}>
          <div style={sd.name}>{day.finisher.label}</div>
          <div style={sd.setsList}>
            <span style={{ ...sd.badge, color: day.color, borderColor: day.color }}>
              {sessionData._finisher.completedRounds}/{day.finisher.rounds} rounds
              {sessionData._finisher.kbWeight ? ` · ${sessionData._finisher.kbWeight} lbs` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

const sd = {
  wrap: { marginTop: '0.6rem' },
  exBlock: { padding: '0.4rem 0', borderBottom: '1px solid var(--border)' },
  name: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' },
  setsList: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  badge: { fontSize: '0.68rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', color: 'var(--muted)', fontWeight: 500 },
}

export default function CalendarView({ calendarData, sessions, onCalendarChange }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState(null)

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const cells = []
  for (let i=0; i<firstDay; i++) cells.push(null)
  for (let d=1; d<=daysInMonth; d++) cells.push(d)
  while (cells.length%7!==0) cells.push(null)

  function prevMonth() { if(viewMonth===0){setViewYear(y=>y-1);setViewMonth(11)}else setViewMonth(m=>m-1) }
  function nextMonth() { if(viewMonth===11){setViewYear(y=>y+1);setViewMonth(0)}else setViewMonth(m=>m+1) }

  function openDay(day) {
    const key = toDateKey(viewYear, viewMonth, day)
    setSelectedDate(key)
    const ex = calendarData[key]
    // types is now an array; support old single-type entries
    const types = ex?.types || (ex?.type ? [ex.type] : [])
    // durations is a map of type -> minutes
    const durations = ex?.durations || (ex?.type && ex?.duration ? { [ex.type]: ex.duration } : {})
    setEditEntry({ types, durations, notes: ex?.notes || '' })
    setModalOpen(true)
  }

  function toggleType(typeId) {
    setEditEntry(e => {
      const has = e.types.includes(typeId)
      const types = has ? e.types.filter(t => t !== typeId) : [...e.types, typeId]
      return { ...e, types }
    })
  }

  function setDuration(typeId, val) {
    setEditEntry(e => ({ ...e, durations: { ...e.durations, [typeId]: val } }))
  }

  function saveEntry() {
    if (!editEntry.types.length) return
    // Store as multi-type entry; keep legacy type field as first for backward compat
    onCalendarChange({
      ...calendarData,
      [selectedDate]: {
        type: editEntry.types[0],
        types: editEntry.types,
        durations: editEntry.durations,
        notes: editEntry.notes,
        // Aggregate duration for tally backward compat
        duration: editEntry.types.reduce((sum, t) => {
          const d = editEntry.durations[t]
          const isWorkout = t === 'A' || t === 'B'
          return sum + (d ? parseInt(d) : (isWorkout ? LIFT_DEFAULT : 0))
        }, 0).toString(),
      }
    })
    setModalOpen(false)
  }

  function deleteEntry() {
    const next = { ...calendarData }; delete next[selectedDate]
    onCalendarChange(next); setModalOpen(false)
  }

  // Time tallies
  const { weeklyMins, monthlyMins } = useMemo(() => {
    const wk = getWeekKey(todayKey)
    const mp = todayKey.slice(0,7)
    let w=0, m=0
    Object.entries(calendarData).forEach(([key, entry]) => {
      const mins = entry.duration ? parseInt(entry.duration) : 0
      if (getWeekKey(key)===wk) w+=mins
      if (key.startsWith(mp)) m+=mins
    })
    return { weeklyMins:w, monthlyMins:m }
  }, [calendarData, todayKey])

  const selectedEntry = selectedDate ? calendarData[selectedDate] : null
  const selectedTypes = selectedEntry?.types || (selectedEntry?.type ? [selectedEntry.type] : [])
  const firstWorkoutType = selectedTypes.find(t => t === 'A' || t === 'B')
  const selectedSession = firstWorkoutType ? sessions?.[selectedDate] : null
  const isWorkoutType = editEntry?.types?.some(t => t === 'A' || t === 'B')

  return (
    <div>
      {/* Header */}
      <div style={styles.calHeader}>
        <div style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button style={styles.navBtn} onClick={prevMonth}>‹</button>
          <button style={styles.navBtn} onClick={nextMonth}>›</button>
        </div>
      </div>

      {/* Tallies */}
      <div style={styles.tallies}>
        <div style={styles.tallyCard}>
          <div style={styles.tallyNum}>{fmtMins(weeklyMins)}</div>
          <div style={styles.tallyLbl}>This week</div>
        </div>
        <div style={styles.tallyDivider} />
        <div style={styles.tallyCard}>
          <div style={styles.tallyNum}>{fmtMins(monthlyMins)}</div>
          <div style={styles.tallyLbl}>{MONTHS[viewMonth].slice(0,3)} total</div>
        </div>
        <div style={styles.tallyNote}>Workouts counted at {LIFT_DEFAULT}min unless overridden</div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {ALL_CALENDAR_TYPES.map(t => (
          <div key={t.id} style={styles.legItem}>
            <div style={{ ...styles.legDot, background: t.color }} />{t.label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={styles.gridWrap}>
        <div style={styles.dowRow}>{DOW.map(d=><div key={d} style={styles.dowCell}>{d}</div>)}</div>
        <div style={styles.dayGrid}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />
            const key = toDateKey(viewYear, viewMonth, day)
            const entry = calendarData[key]
            const isToday = key === todayKey
            const entryTypes = entry?.types || (entry?.type ? [entry.type] : [])
            const info = entryTypes.length > 0 ? typeInfo(entryTypes[0]) : null
            const mins = entry?.duration ? parseInt(entry.duration) : null
            return (
              <div key={key} onClick={()=>openDay(day)} style={{ ...styles.dayCell, background: isToday ? 'var(--accent-light)' : 'var(--surface)', border: isToday ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                <div style={{ ...styles.dayNum, color: isToday?'var(--accent)':'var(--text)', fontWeight: isToday?700:400 }}>{day}</div>
                {info && <div style={{ ...styles.entryPill, background:info.bg, color:info.color }}>{entryTypes.length > 1 ? `${entryTypes.length} acts` : info.label.slice(0,4)}</div>}
                {mins > 0 && <div style={styles.minsLabel}>{fmtMins(mins)}</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div style={styles.recentSection}>
        <div style={styles.sectionLabel}>Recent Activity</div>
        {Object.entries(calendarData).sort(([a],[b])=>b.localeCompare(a)).slice(0,10).map(([key, entry]) => {
          const entryTypes = entry?.types || (entry?.type ? [entry.type] : [])
          const info = typeInfo(entryTypes[0] || '')
          const [,m,d] = key.split('-')
          const dateStr = `${MONTHS[parseInt(m)-1].slice(0,3)} ${parseInt(d)}`
          const workoutType = entryTypes.find(t => t === 'A' || t === 'B')
          const sess = workoutType ? sessions?.[key] : null
          const mins = entry.duration ? parseInt(entry.duration) : null
          return (
            <div key={key} style={styles.recentRow} onClick={()=>{ setSelectedDate(key); const types=entry?.types||(entry?.type?[entry.type]:[]);const durations=entry?.durations||(entry?.type&&entry?.duration?{[entry.type]:entry.duration}:{});setEditEntry({types,durations,notes:entry.notes||''}); setModalOpen(true) }}>
              <div style={{ ...styles.recentAccent, background:info.color }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={styles.recentTop}>
                  <span style={styles.recentDate}>{dateStr}</span>
                  {entryTypes.map(tid => { const ti = typeInfo(tid); return <span key={tid} style={{ ...styles.recentType, color:ti.color, background:ti.bg }}>{ti.label}</span> })}
                  {mins > 0 && <span style={styles.recentMins}>{fmtMins(mins)}</span>}
                </div>
                {entry.notes && <div style={styles.recentNote}>{entry.notes}</div>}
                {sess && workoutType && DAYS[workoutType] && (
                  <div style={styles.recentSets}>
                    {DAYS[workoutType].exercises.map(ex => {
                      const exData = sess[ex.id]
                      if (!exData?.sets) return null
                      const done = exData.sets.filter(s => s.done)
                      if (!done.length) return null
                      const w = done[0]?.weight || '?'
                      return <span key={ex.id} style={styles.miniSet}>{ex.name.split(' ').pop()}: {done.length}×{done[0]?.reps||ex.reps} @ {w}lb</span>
                    })}
                    {sess._finisher?.completedRounds > 0 && (
                      <span style={{ ...styles.miniSet, color: info.color }}>{DAYS[workoutType].finisher.label}: {sess._finisher.completedRounds}/{DAYS[workoutType].finisher.rounds} rounds</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {Object.keys(calendarData).length === 0 && <div style={styles.emptyMsg}>No activity logged yet — tap a day to add one.</div>}
      </div>

      {/* Modal */}
      {modalOpen && editEntry && (
        <div style={styles.overlay} onClick={()=>setModalOpen(false)}>
          <div style={styles.modal} onClick={e=>e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalDate}>{formatDate(selectedDate)}</div>
              <button style={styles.closeBtn} onClick={()=>setModalOpen(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {selectedSession && firstWorkoutType && (
                <div style={{ marginBottom:'1.25rem' }}>
                  <div style={styles.fieldLabel}>Workout Log</div>
                  <div style={{ ...styles.sessionCard, borderColor: typeInfo(firstWorkoutType).color }}>
                    <SessionDetail dayType={firstWorkoutType} sessionData={selectedSession} />
                  </div>
                </div>
              )}

              <div style={styles.fieldLabel}>Activities <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>— select all that apply</span></div>
              <div style={styles.typeGrid}>
                {ALL_CALENDAR_TYPES.map(t => {
                  const selected = editEntry.types?.includes(t.id)
                  return (
                    <button key={t.id} onClick={() => toggleType(t.id)} style={{ ...styles.typeBtn, border: selected ? `2px solid ${t.color}` : '1.5px solid var(--border)', color: selected ? t.color : 'var(--muted)', background: selected ? t.bg : 'var(--surface)', fontWeight: selected ? 700 : 500 }}>
                      <div style={{ ...styles.typeDot, background: t.color }} />{t.label}
                    </button>
                  )
                })}
              </div>

              {/* Per-activity duration fields */}
              {editEntry.types?.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={styles.fieldLabel}>Duration (minutes)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editEntry.types.map(typeId => {
                      const info = typeInfo(typeId)
                      const isWkt = typeId === 'A' || typeId === 'B'
                      return (
                        <div key={typeId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ ...styles.durationLabel, color: info.color, background: info.bg }}>
                            {info.label}
                          </div>
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder={isWkt ? `${LIFT_DEFAULT}` : '0'}
                            value={editEntry.durations?.[typeId] || ''}
                            onChange={e => setDuration(typeId, e.target.value)}
                            style={styles.durationInputSmall}
                          />
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>min</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ ...styles.fieldLabel, marginTop:'1.25rem' }}>Notes</div>
              <textarea value={editEntry.notes} onChange={e=>setEditEntry(en=>({...en,notes:e.target.value}))} placeholder="How it went, PRs, how you felt..." style={styles.textarea} rows={3} />

              <div style={styles.modalActions}>
                {calendarData[selectedDate] && <button style={styles.deleteBtn} onClick={deleteEntry}>Delete</button>}
                <button style={{ ...styles.saveBtn, opacity: editEntry.types?.length ? 1 : 0.4 }} onClick={saveEntry} disabled={!editEntry.types?.length}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  calHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', background:'var(--surface)' },
  monthLabel: { fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.5rem', textTransform:'uppercase', letterSpacing:'0.05em' },
  navBtn: { width:'40px', height:'40px', background:'var(--surface)', border:'1.5px solid var(--border2)', color:'var(--text)', borderRadius:'8px', fontSize:'1.3rem', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow)', cursor:'pointer' },
  tallies: { display:'flex', alignItems:'center', background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'1rem 1.5rem', flexWrap:'wrap', rowGap:'0.5rem' },
  tallyCard: { textAlign:'center', flex:'0 0 auto', padding:'0 1.25rem' },
  tallyNum: { fontFamily:'var(--font-display)', fontWeight:900, fontSize:'2rem', color:'var(--accent)', lineHeight:1 },
  tallyLbl: { fontSize:'0.62rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted)', marginTop:'2px' },
  tallyDivider: { width:'1px', height:'40px', background:'var(--border)', flexShrink:0 },
  tallyNote: { fontSize:'0.62rem', color:'var(--muted2)', marginLeft:'auto', maxWidth:'160px', lineHeight:1.4, textAlign:'right' },
  legend: { display:'flex', gap:'10px', padding:'0.6rem 1.5rem', borderBottom:'1px solid var(--border)', flexWrap:'wrap', background:'var(--surface)' },
  legItem: { display:'flex', alignItems:'center', gap:'4px', fontSize:'0.62rem', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--muted)' },
  legDot: { width:'7px', height:'7px', borderRadius:'50%', flexShrink:0 },
  gridWrap: { padding:'1rem 1.25rem', background:'var(--bg)' },
  dowRow: { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px', marginBottom:'4px' },
  dowCell: { textAlign:'center', fontSize:'0.62rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', padding:'4px 0' },
  dayGrid: { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px' },
  dayCell: { minHeight:'62px', borderRadius:'8px', cursor:'pointer', padding:'5px 4px', display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' },
  dayNum: { fontFamily:'var(--font-display)', fontSize:'1rem', lineHeight:1 },
  entryPill: { fontSize:'0.52rem', fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase', padding:'1px 4px', borderRadius:'3px' },
  minsLabel: { fontSize:'0.55rem', color:'var(--muted)', fontWeight:500 },
  recentSection: { padding:'0 1.25rem 2rem', background:'var(--bg)' },
  sectionLabel: { fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--muted)', padding:'1rem 0 0.5rem', borderBottom:'1px solid var(--border)', marginBottom:'0.25rem' },
  recentRow: { display:'flex', gap:'10px', padding:'0.75rem 0', borderBottom:'1px solid var(--border)', cursor:'pointer', alignItems:'flex-start' },
  recentAccent: { width:'3px', borderRadius:'2px', flexShrink:0, alignSelf:'stretch', minHeight:'20px' },
  recentTop: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px', flexWrap:'wrap' },
  recentDate: { fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.95rem', color:'var(--muted)' },
  recentType: { fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'2px 7px', borderRadius:'4px' },
  recentMins: { fontSize:'0.7rem', color:'var(--muted)', fontWeight:500, marginLeft:'auto' },
  recentNote: { fontSize:'0.78rem', color:'var(--muted)', marginTop:'2px' },
  recentSets: { display:'flex', flexWrap:'wrap', gap:'4px', marginTop:'5px' },
  miniSet: { fontSize:'0.65rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'4px', padding:'2px 6px', color:'var(--muted)' },
  emptyMsg: { fontSize:'0.85rem', color:'var(--muted)', padding:'1.5rem 0', textAlign:'center' },
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  modal: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', width:'100%', maxWidth:'440px', overflow:'hidden', boxShadow:'var(--shadow-md)', maxHeight:'90vh', overflowY:'auto' },
  modalHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.1rem 1.25rem', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--surface)', zIndex:1 },
  modalDate: { fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.2rem', textTransform:'uppercase', letterSpacing:'0.05em' },
  closeBtn: { width:'32px', height:'32px', background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--muted)', borderRadius:'6px', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  modalBody: { padding:'1.25rem' },
  sessionCard: { background:'var(--surface2)', border:'1px solid', borderRadius:'8px', padding:'0.75rem 1rem' },
  fieldLabel: { fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.6rem', fontWeight:600 },
  durationHint: { fontSize:'0.6rem', fontWeight:400, textTransform:'none', letterSpacing:0, color:'var(--muted2)' },
  durationLabel: { fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', flexShrink: 0, minWidth: '80px', textAlign: 'center' },
  durationInputSmall: { flex: 1, background: 'var(--surface2)', border: '1.5px solid var(--border2)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center', padding: '6px 4px', outline: 'none', minWidth: 0 },
  typeGrid: { display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'6px' },
  typeBtn: { padding:'10px 6px', borderRadius:'8px', fontFamily:'var(--font-display)', fontSize:'0.78rem', letterSpacing:'0.05em', textTransform:'uppercase', display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', transition:'all 0.15s', cursor:'pointer' },
  typeDot: { width:'8px', height:'8px', borderRadius:'50%' },
  textarea: { width:'100%', background:'var(--surface2)', border:'1.5px solid var(--border2)', borderRadius:'8px', color:'var(--text)', fontFamily:'var(--font-body)', fontSize:'0.9rem', padding:'0.65rem 0.75rem', outline:'none', resize:'vertical', lineHeight:1.5 },
  modalActions: { display:'flex', gap:'8px', marginTop:'1rem', justifyContent:'flex-end' },
  deleteBtn: { padding:'0.7rem 1.1rem', background:'var(--other-light)', border:'1.5px solid var(--other)', color:'var(--other)', borderRadius:'8px', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.85rem', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' },
  saveBtn: { padding:'0.7rem 1.5rem', background:'var(--accent)', border:'none', color:'#fff', borderRadius:'8px', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.9rem', letterSpacing:'0.1em', textTransform:'uppercase', transition:'opacity 0.15s', cursor:'pointer' },
}
