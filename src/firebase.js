// src/firebase.js
// ─────────────────────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com
// 2. Create a project (e.g. "eos-training")
// 3. Add a Web app — copy the firebaseConfig object below
// 4. Enable Authentication → Google sign-in provider
// 5. Enable Firestore Database (start in production mode)
// 6. Add this Firestore security rule:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /users/{userId}/{document=**} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//      }
//    }
// ─────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Fixed ID — only your devices will ever use this app, no auth needed.
// Change this to any random string you like.
export const USER_ID = 'brady-family-gym'
