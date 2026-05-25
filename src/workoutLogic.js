import { DAYS } from './data.js'

export function getTodayDayType(sessions, todayKey) {
  const pastKeys = Object.keys(sessions)
    .filter(k => k !== todayKey && sessions[k]._dayType)
    .sort()
  if (pastKeys.length === 0) return 'A'
  const last = sessions[pastKeys[pastKeys.length - 1]]._dayType
  return last === 'A' ? 'B' : 'A'
}

/**
 * Get the last recorded sets array for an exercise on a specific day type.
 * Returns the sets array from the most recent same-day session.
 */
export function getLastSets(sessions, todayKey, dayType, exId) {
  const keys = Object.keys(sessions)
    .filter(k => k !== todayKey && sessions[k]._dayType === dayType)
    .sort()
    .reverse()
  for (const k of keys) {
    const sets = sessions[k][exId]?.sets
    if (sets && sets.length > 0) return sets
  }
  return null
}

/**
 * Get last finisher KB weight for a specific day type.
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
 * Build an initial sets array for an exercise.
 * Prefills weight from last session, reps from target.
 * bumped = true means "add weight next time" was checked last session.
 */
export function buildInitialSets(exercise, lastSets, isAssisted) {
  return Array.from({ length: exercise.sets }, (_, i) => {
    const lastSet = lastSets?.[i]
    // Weight: use last set's weight if available, else ''
    const lastWeight = lastSet?.weight || lastSets?.[0]?.weight || ''
    // If "add weight next time" was flagged last session, bump it
    const shouldBump = lastSets?.[0]?.addWeightNext === true
    let weight = lastWeight
    if (shouldBump && lastWeight) {
      const bump = isAssisted ? -5 : (exercise.id === 'leg-press' || exercise.id === 'step-ups' ? 10 : 5)
      const bumped = parseFloat(lastWeight) + bump
      weight = bumped > 0 ? bumped.toString() : '0'
    }
    return {
      reps: (lastSet?.reps ?? exercise.reps).toString(),
      weight,
      done: false,
      addWeightNext: false,
    }
  })
}

/**
 * Build prefill data for all exercises in today's day.
 */
export function buildPrefillData(sessions, todayKey, dayType) {
  const day = DAYS[dayType]
  if (!day) return {}

  const result = {}
  day.exercises.forEach(ex => {
    const isAssisted = ex.tag === 'assisted'
    const lastSets = getLastSets(sessions, todayKey, dayType, ex.id)
    result[ex.id] = { sets: buildInitialSets(ex, lastSets, isAssisted) }
  })

  const lastFinisher = getLastFinisherWeight(sessions, todayKey, dayType)
  result._finisherWeight = lastFinisher || ''

  return result
}
