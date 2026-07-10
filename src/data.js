// ── Day A: Upper ─────────────────────────────────────────────
export const DAY_A = {
  id: 'A',
  name: 'Upper',
  label: 'Day A — Upper',
  color: 'var(--pull)',
  bg: 'var(--pull-light)',
  tip: 'Add 5 lbs to upper lifts and RDL when all sets are clean. For assisted machines, reduce assistance by 5 lbs instead.',
  exercises: [
    { id: 'rdl',            name: 'RDL',                 tag: 'barbell', sets: 3, reps: 8,  note: 'Hinge at hips, soft knee — stop at hamstring stretch' },
    { id: 'chest-press',    name: 'Chest Press',         tag: 'machine',  sets: 3, reps: 10, note: 'Machine — adjust seat so handles align with mid-chest' },
    { id: 'lat-pulldown',   name: 'Lat Pulldown',        tag: 'machine',  sets: 3, reps: 10, note: 'Wide grip — pull to upper chest, slight lean back' },
    { id: 'cable-row',      name: 'Cable Row',            tag: 'cable',   sets: 3, reps: 10, note: 'Pull to lower chest, pause 1 sec at peak' },
    { id: 'shoulder-press', name: 'Shoulder Press',       tag: 'machine',  sets: 3, reps: 10, note: "Machine — don't shrug at the top" },
    { id: 'assisted-pullups', name: 'Assisted Pull-ups',  tag: 'assisted', sets: 3, reps: 10, note: 'Lower assistance = harder — full hang at bottom' },
  ],
  finisher: {
    id: 'kb-upper',
    label: 'KB Finisher',
    rounds: 3,
    note: 'No rest between movements · ~60 sec between rounds',
    weightLabel: 'KB Weight',
    movements: [
      { id: 'sdl-r',   name: 'Suitcase Deadlift', side: 'R', reps: 10, note: 'KB outside right foot — tall spine, drive through heel' },
      { id: 'swing-1', name: 'KB Swing',           side: null, reps: 15, note: 'Hip hinge — power from glutes, not arms' },
      { id: 'sdl-l',   name: 'Suitcase Deadlift', side: 'L', reps: 10, note: 'KB outside left foot — same cues' },
      { id: 'swing-2', name: 'KB Swing',           side: null, reps: 15, note: 'Stay explosive through all 15' },
    ],
  },
}

// ── Day B: Lower ─────────────────────────────────────────────
export const DAY_B = {
  id: 'B',
  name: 'Lower',
  label: 'Day B — Lower',
  color: 'var(--legs)',
  bg: 'var(--legs-light)',
  tip: 'Add 10 lbs to leg press and step-ups when all sets are clean. Add 5 lbs to deadlift.',
  exercises: [
    { id: 'leg-press',  name: 'Leg Press',  tag: 'machine', sets: 5, reps: 10, note: "Feet shoulder-width mid-plate — don't lock out at top" },
    { id: 'deadlift',   name: 'Deadlift',   tag: 'barbell', sets: 4, reps: 6,  note: 'Hip hinge — bar over mid-foot, flat back, drive through floor' },
    { id: 'step-ups',   name: 'Step-ups',   tag: 'db',      sets: 3, reps: 10, note: 'Hold DBs — full hip extension at top, control the step down' },
  ],
  finisher: {
    id: 'lower-finisher',
    label: 'Lower Finisher',
    rounds: 5,
    note: 'No rest between movements · ~60 sec between rounds',
    weightLabel: 'KB Weight (Goblet)',
    movements: [
      { id: 'lunges',  name: 'Walking Lunges', side: null, reps: 12, note: 'Long stride — back knee hovers above floor' },
      { id: 'goblet',  name: 'Goblet Squat',   side: null, reps: 10, note: 'KB at chest — sit between heels, tall chest' },
    ],
  },
}

export const DAYS = { A: DAY_A, B: DAY_B }

export const TAG_META = {
  machine:  { label: 'Machine',    color: 'var(--pull)',  bg: 'var(--pull-light)'      },
  cable:    { label: 'Cable',      color: '#6200ea',      bg: 'var(--gym-class-light)' },
  barbell:  { label: 'Barbell',    color: 'var(--legs)',  bg: 'var(--legs-light)'      },
  assisted: { label: 'Assisted',   color: 'var(--push)',  bg: 'var(--push-light)'      },
  db:       { label: 'Dumbbell',   color: 'var(--hike)',  bg: 'var(--hike-light)'      },
}

export const ACTIVITY_TYPES = [
  { id: 'gym-class', label: 'Gym Class', color: 'var(--gym-class)', bg: 'var(--gym-class-light)' },
  { id: 'hiking',    label: 'Hiking',    color: 'var(--hike)',      bg: 'var(--hike-light)'      },
  { id: 'other',     label: 'Other',     color: 'var(--other)',     bg: 'var(--other-light)'     },
]

export const WORKOUT_TYPE_A = { id: 'A', label: 'Upper (A)', color: 'var(--pull)', bg: 'var(--pull-light)' }
export const WORKOUT_TYPE_B = { id: 'B', label: 'Lower (B)', color: 'var(--legs)', bg: 'var(--legs-light)' }

export const ALL_CALENDAR_TYPES = [
  WORKOUT_TYPE_A,
  WORKOUT_TYPE_B,
  ...ACTIVITY_TYPES,
]
