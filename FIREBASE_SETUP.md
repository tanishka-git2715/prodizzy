# Firebase Authentication Setup Guide

## Changes Made

Successfully migrated from Supabase Auth to Firebase Authentication with Google Sign-In support. The backend database operations still use Supabase (unchanged), but all frontend authentication now uses Firebase.

### Files Updated

**Authentication Core:**
- `client/src/lib/firebase.ts` - NEW: Firebase configuration and initialization
- `client/src/hooks/use-auth.ts` - Updated to use Firebase auth state
- `.env` - Added Firebase environment variables

**Pages Updated:**
1. `client/src/pages/Home.tsx` - Google OAuth + email/password login
2. `client/src/pages/Login.tsx` - Google OAuth + email/password login
3. `client/src/pages/Onboard.tsx` - Startup onboarding with Firebase signup
4. `client/src/pages/PartnerOnboard.tsx` - Partner onboarding with Firebase signup
5. `client/src/pages/IndividualOnboard.tsx` - Individual onboarding with Firebase signup
6. `client/src/pages/InvestorOnboard.tsx` - Investor onboarding with Firebase signup
7. `client/src/pages/Dashboard.tsx` - Firebase signOut
8. `client/src/pages/Admin.tsx` - Firebase signOut
9. `client/src/pages/Discover.tsx` - Firebase signOut

### Key Features

✅ **Google Sign-In with popup** (no redirect required)
✅ **Email/password authentication** (fallback option)
✅ **Auto-fill email** from authenticated session in onboarding forms
✅ **Skip account creation** when users are already authenticated via Google
✅ **Session persistence** across page reloads
✅ **Token management** for backend API calls

---

## Firebase Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `prodizzy` (or your preferred name)
4. Disable Google Analytics (optional, can enable later)
5. Click "Create project"

### 2. Enable Google Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on **Google** provider
5. Toggle "Enable"
6. Enter support email (your email)
7. Click "Save"

### 3. Enable Email/Password Authentication

1. Still in **Sign-in method** tab
2. Click on **Email/Password** provider
3. Toggle "Enable" (first option, not "Email link")
4. Click "Save"

### 4. Register Web App

1. In Project Overview, click the **Web** icon (`</>`)
2. Enter app nickname: `prodizzy-web`
3. **Do NOT** check "Firebase Hosting" (using Vercel)
4. Click "Register app"
5. Copy the `firebaseConfig` object values

### 5. Configure Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (already added by default)
   - Your production domain (e.g., `prodizzy.vercel.app`)
   - Your custom domain if you have one

### 6. Update Environment Variables

Update your `.env` file with the values from Firebase config:

```bash
# Firebase Configuration (from Step 4)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=prodizzy-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=prodizzy-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=prodizzy-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 7. Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add all 6 Firebase variables (same as in `.env`)
4. Make sure to add them for all environments (Production, Preview, Development)

---

## Testing the Integration

### Test Google Sign-In

1. Go to your app homepage
2. Click "Join now"
3. Click "Continue with Google"
4. Select your Google account
5. Should be redirected back with auth state
6. Role selection modal should appear
7. Complete onboarding
8. Should redirect to dashboard

### Test Email Sign-Up

1. Go to onboarding page directly
2. Fill in all steps
3. On final step, enter email/password
4. Click "Create account"
5. Should create Firebase user and save profile
6. Should redirect to dashboard

### Verify in Firebase Console

1. Go to **Authentication** → **Users**
2. Should see newly created users
3. Check provider (Google or Email/Password)
4. Verify UID matches what's stored in Supabase database

---

## How It Works

### Authentication Flow

1. **User signs in with Google** → Firebase creates user account
2. **Firebase generates ID token** → Passed to backend as `Bearer` token
3. **Backend validates token** → Currently uses Supabase RLS (will need update)
4. **Profile saved to Supabase** → Using user's Firebase UID

### Token Management

- Firebase ID tokens are **JWT tokens**
- They expire after 1 hour
- Firebase SDK automatically refreshes them
- The `useAuth()` hook manages token state
- All API calls use `session.access_token` (Firebase ID token)

### Important Notes

⚠️ **Backend Token Validation**: The backend API endpoints (`/api/profile`, `/api/partner`, etc.) currently use Supabase's `getUser()` to validate tokens. This needs to be updated to validate Firebase ID tokens using Firebase Admin SDK.

⚠️ **User ID Sync**: Make sure the `user_id` in your Supabase database tables matches the Firebase UID (not Supabase auth UID).

---

## Next Steps (Backend Updates Required)

To fully complete the Firebase migration, you need to update the backend:

### Option 1: Use Firebase Admin SDK (Recommended)

Install Firebase Admin:
```bash
npm install firebase-admin
```

Update API endpoints to validate Firebase tokens:
```typescript
import { getAuth } from 'firebase-admin/auth';

// In each API endpoint:
const token = req.headers.authorization?.slice(7);
const decodedToken = await getAuth().verifyIdToken(token);
const userId = decodedToken.uid;
```

### Option 2: Keep Using Supabase Database Only

If you want to keep Supabase for database but use Firebase for auth:
- Remove Supabase auth validation
- Validate Firebase tokens manually
- Use Firebase UID as `user_id` in database

---

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to **Authorized domains** in Firebase Console
- Clear browser cache and try again

### "Firebase: Error (auth/popup-blocked)"
- Browser blocked the popup
- User needs to allow popups for your domain
- Alternative: Use redirect-based flow instead

### "Session not persisting after refresh"
- Check browser localStorage is enabled
- Firebase auth state is stored in localStorage by default
- Check console for errors

### Backend returns 401 Unauthorized
- Firebase token might not be accepted by Supabase
- Need to implement Firebase token validation on backend
- See "Next Steps" section above

---

## Development vs Production

### Development (localhost)
- `localhost` is automatically authorized
- No additional setup needed

### Production (Vercel)
1. Add your Vercel domain to **Authorized domains**
2. Set environment variables in Vercel dashboard
3. Redeploy after adding variables

---

## Security Notes

✅ **API keys in client code are safe** - Firebase API keys are not secret
✅ **Security Rules protect data** - Supabase RLS still applies
✅ **Tokens are validated server-side** - Backend verifies all tokens
⚠️ **Update backend validation** - Need Firebase Admin SDK for proper validation

---

## Support Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)
