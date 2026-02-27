import { getAuthInstance, getDatabaseInstance } from './firebase'
import { ref, get, set, update } from 'firebase/database'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth'
import { User, UserRole, LoginRequest } from './types'
import crypto from 'crypto'

// Generate a secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function registerUser(email: string, password: string, name: string, role: UserRole = UserRole.CASHIER): Promise<User> {
  const auth = getAuthInstance()
  const database = getDatabaseInstance()

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    const now = Date.now()
    const newUser: User = {
      id: uid,
      email,
      name,
      role,
      createdAt: now,
      lastLogin: null,
      isActive: true,
    }

    await set(ref(database, `users/${uid}`), newUser)
    return newUser
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`)
  }
}

const ALLOWED_EMAILS = [
  'chirinosyonathan06@gmail.com',
  'bodegachirinos07@gmail.com'
]

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  const auth = getAuthInstance()
  const database = getDatabaseInstance()

  // Restrict access to allowed emails only
  if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
    throw new Error('Access restricted. Only authorized users can login.')
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    // Get user data
    const userRef = ref(database, `users/${uid}`)
    const userSnapshot = await get(userRef)

    if (!userSnapshot.exists()) {
      throw new Error('User profile not found')
    }

    const user = userSnapshot.val() as User

    if (!user.isActive) {
      throw new Error('User account is inactive')
    }

    // Update last login
    const now = Date.now()
    await update(userRef, { lastLogin: now })

    // Generate session token
    const token = generateToken()
    const expiresAt = now + 24 * 60 * 60 * 1000 // 24 hours

    // Store session in database
    await set(ref(database, `sessions/${token}`), {
      userId: uid,
      userRole: user.role,
      expiresAt,
      createdAt: now,
    })

    return { user, token }
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`)
  }
}

export async function verifySession(token: string): Promise<User | null> {
  const database = getDatabaseInstance()

  try {
    const sessionRef = ref(database, `sessions/${token}`)
    const sessionSnapshot = await get(sessionRef)

    if (!sessionSnapshot.exists()) {
      return null
    }

    const session = sessionSnapshot.val()

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      return null
    }

    // Get user data
    const userRef = ref(database, `users/${session.userId}`)
    const userSnapshot = await get(userRef)

    if (!userSnapshot.exists()) {
      return null
    }

    const user = userSnapshot.val() as User
    return user.isActive ? user : null
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
}

export async function logoutUser(token: string): Promise<void> {
  const database = getDatabaseInstance()
  const auth = getAuthInstance()

  try {
    // Delete session from database
    await set(ref(database, `sessions/${token}`), null)
    
    // Sign out from Firebase
    await firebaseSignOut(auth)
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`)
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  const database = getDatabaseInstance()

  try {
    const userRef = ref(database, `users/${userId}`)
    const userSnapshot = await get(userRef)

    if (!userSnapshot.exists()) {
      return null
    }

    return userSnapshot.val() as User
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
  const database = getDatabaseInstance()

  try {
    const userRef = ref(database, `users/${userId}`)
    await update(userRef, updates)

    const userSnapshot = await get(userRef)
    return userSnapshot.val() as User
  } catch (error: any) {
    throw new Error(`Update failed: ${error.message}`)
  }
}
