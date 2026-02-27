# Bodega Chirinos - Deployment Guide

## Pre-Deployment Requirements

### 1. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Realtime Database and Authentication
3. Copy your Firebase config values
4. Set up security rules for:
   - `/users/` - Read own data only
   - `/system/exchangeRate` - Admin write only
   - `/inventory/` - Read all, write for authorized users
   - `/transactions/` - Append only, read own data

### 2. Environment Variables
Add these to your Vercel project settings:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Deployment Steps

### Option 1: Deploy via Vercel UI
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add Firebase environment variables
5. Click Deploy

### Option 2: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
# Follow prompts and add environment variables
```

## Post-Deployment

### Authorized Users
The system is restricted to these two emails only:
- chirinosyonathan06@gmail.com
- bodegachirinos07@gmail.com

You must create these users in Firebase Authentication before they can login.

### First Login
1. Go to your deployed URL
2. Login with one of the authorized emails
3. Go to Admin Dashboard (/admin)
4. Set the initial exchange rate (Tasa del Día)
5. Start adding inventory items

## Key Features Deployed

✅ **Authentication** - Restricted to 2 authorized emails
✅ **Admin Dashboard** - Exchange Rate Master (real-time broadcast)
✅ **Inventory Management** - Full CRUD with:
   - 3-decimal precision for weight/volume (step="0.001")
   - Desempaquetado (Fractionable) toggle for items sold by weight/volume
   - Real-time sync across all connected clients

## Support

For Firebase issues, visit: https://firebase.google.com/docs
For Vercel deployment issues, visit: https://vercel.com/docs
