import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getDatabase, Database } from 'firebase/database'
import { getStorage, FirebaseStorage } from 'firebase/storage'

let app: FirebaseApp
let auth: Auth
let database: Database
let storage: FirebaseStorage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function initializeFirebase() {
  if (typeof window !== 'undefined' && !app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    database = getDatabase(app)
    storage = getStorage(app)
  }
  return { app, auth, database, storage }
}

export function getFirebaseServices() {
  if (typeof window !== 'undefined') {
    if (!app) {
      return initializeFirebase()
    }
    return { app, auth, database, storage }
  }
  throw new Error('Firebase can only be accessed from the client')
}

export function getAuthInstance() {
  if (!auth && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return auth
}

export function getDatabaseInstance() {
  if (!database && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return database
}

export function getStorageInstance() {
  if (!storage && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return storage
}
