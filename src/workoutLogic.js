import { DAYS } from './data.js'

/**
 * Alternate A → B → A → B based on last session.
 * sessions: { 'YYYY-MM-DD': { _dayType: 'A'|'B', ... } }
 */
export function getTodayDayType(sessions, todayKey) {
  const pastKeys = Object.keys(sessions)
    .filter(k => k !== todayKey && sessions[k]._dayType)
    .sort()

  if (pastKeys.length === 0) return 'A' // first session ever = A
  const last = sessions[pastKeys[pastKeys.length - 1]]._dayType
  return last === 'A' ? 'B' : 'A'
}

/**
 * Get the last recorded weight for an exercise on a specific day type.
 * Used to prefill today's weight.
 */
export function getLastWeight(sessions, todayKey, dayType, exId) {
  const keys = Object.keys(sessions)
    .filter(k => k !== todayKey && sessions[k]._dayType === dayType)
    .sort()
    .reverse()

  for (const k of keys) {
    const w = sessions[k][exId]?.weight
    if (w) return parseFloat(w)
  }
  return null
}

/**
 * Get the last finisher KB weight for a specific day type.
 */
export function getLastFinisherWeight(sessions, todayKey, dayType) {
  const keys = Object.keys(sessions)
    .filter(k => k !== todayKey && sessions[k]._dayType === dayType)
    .sort()
    .reverse()

  for (const k of keys) {
    const w = sessions[k]._finisher?.kbWeight
    if (w) return w
  }
  return null
}

/**
 * Build prefill data for all exercises in today's day.
 * Returns { exId: { weight: string, reps: string } }
 * Weight is the last recorded weight for that exercise on that day type.
 * No auto-increment — user decides when to go up (per progression rules).
 */
export function buildPrefillData(sessions, todayKey, dayType) {
  const day = DAYS[dayType]
  if (!day) return {}

  const result = {}
  day.exercises.forEach(ex => {
    const lastWeight = getLastWeight(sessions, todayKey, dayType, ex.id)
    result[ex.id] = {
      weight: lastWeight !== null ? lastWeight.toString() : '',
      reps: ex.reps.toString(),
    }
  })

  // Finisher weight
  const lastFinisher = getLastFinisherWeight(sessions, todayKey, dayType)
  result._finisherWeight = lastFinisher || ''

  return result
}
