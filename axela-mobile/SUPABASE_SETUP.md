# Supabase Configuration

## How to set up:

1. Open `src/lib/supabase.js`
2. Replace the placeholder values with your actual Supabase credentials:
   - `YOUR_SUPABASE_URL` - Your Supabase project URL
   - `YOUR_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Finding your credentials:

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Project API keys → anon/public key

## Example:

```javascript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Authentication Setup:

Your Supabase database should have the default `auth.users` table enabled. 
The authentication screens will handle:
- Sign up (creates user in auth.users)
- Sign in (email/password)
- Password reset
- Session management

No additional tables are required unless you want to store user profiles.
