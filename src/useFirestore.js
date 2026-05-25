import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db, USER_ID } from './firebase.js'

export function useFirestore(collection, key, initialValue) {
  const lsKey = `${collection}_${key}`
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(lsKey)
      return stored ? JSON.parse(stored) : initialValue
    } catch { return initialValue }
  })
  const [loading, setLoading] = useState(true)
  const writeTimer = useRef(null)

  useEffect(() => {
    const ref = doc(db, 'users', USER_ID, collection, key)
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data().value
        setValue(data)
        try { localStorage.setItem(lsKey, JSON.stringify(data)) } catch {}
      }
      setLoading(false)
    }, err => {
      console.error('Firestore read error:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [collection, key])

  function update(newValue) {
    const resolved = typeof newValue === 'function' ? newValue(value) : newValue
    setValue(resolved)
    try { localStorage.setItem(lsKey, JSON.stringify(resolved)) } catch {}
    clearTimeout(writeTimer.current)
    writeTimer.current = setTimeout(() => {
      const ref = doc(db, 'users', USER_ID, collection, key)
      setDoc(ref, { value: resolved }).catch(err => console.error('Firestore write error:', err))
    }, 800)
  }

  return [value, update, loading]
}
