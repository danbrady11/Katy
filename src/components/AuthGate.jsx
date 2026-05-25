// src/components/AuthGate.jsx
import React, { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase.js'

export function SignInScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      setError('Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.logo}>EOS <span style={{ color: 'var(--accent)' }}>Training</span></div>
        <div style={styles.sub}>Sign in to sync your workouts across devices</div>
        <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} onClick={handleSignIn} disabled={loading}>
          <GoogleIcon />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  )
}

export function UserMenu({ user }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button style={styles.avatar} onClick={() => setOpen(o => !o)} title={user.displayName}>
        {user.photoURL
          ? <img src={user.photoURL} style={{ width: 32, height: 32, borderRadius: '50%' }} referrerPolicy="no-referrer" />
          : <span style={styles.avatarInitial}>{(user.displayName || user.email || '?')[0].toUpperCase()}</span>
        }
      </button>
      {open && (
        <div style={styles.menu}>
          <div style={styles.menuName}>{user.displayName || user.email}</div>
          <button style={styles.signOutBtn} onClick={() => signOut(auth)}>Sign out</button>
        </div>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

const styles = {
  screen: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', padding: '1.5rem',
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
    padding: '2.5rem 2rem', maxWidth: '360px', width: '100%', textAlign: 'center',
    boxShadow: 'var(--shadow-md)',
  },
  logo: {
    fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem',
    textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '0.5rem',
  },
  sub: { fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.5 },
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '0.9rem 1rem',
    background: 'var(--surface)', border: '1.5px solid var(--border2)',
    borderRadius: '10px', cursor: 'pointer',
    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
    letterSpacing: '0.05em', color: 'var(--text)',
    boxShadow: 'var(--shadow)', transition: 'opacity 0.15s',
  },
  error: { marginTop: '1rem', fontSize: '0.8rem', color: 'var(--other)', padding: '0.5rem', background: 'var(--other-light)', borderRadius: '6px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--border2)',
    background: 'var(--surface2)', cursor: 'pointer', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  avatarInitial: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' },
  menu: {
    position: 'absolute', right: 0, top: '44px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '10px', padding: '0.75rem', minWidth: '180px',
    boxShadow: 'var(--shadow-md)', zIndex: 200,
  },
  menuName: { fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' },
  signOutBtn: {
    width: '100%', padding: '0.6rem', background: 'var(--other-light)', border: '1px solid var(--other)',
    color: 'var(--other)', borderRadius: '6px', fontFamily: 'var(--font-display)', fontWeight: 700,
    fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
  },
}
