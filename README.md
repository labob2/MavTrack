# MavTrack

A GPA, credit, and scholarship tracker with real accounts — your data follows you across every device you log in from.

## Set up Supabase (one-time)

1. Go to [supabase.com](https://supabase.com), sign up, and create a new project (pick any name/region; the free tier is enough).
2. Once the project is ready, open **SQL Editor** in the left sidebar → **New query**.
3. Paste in the entire contents of `supabase-schema.sql` (included in this folder) and click **Run**. This creates all the tables and locks each one down so users can only ever see their own data.
4. Go to **Project Settings → API**. You'll need two values from this page:
   - **Project URL**
   - **anon public** key
5. In this project folder, copy `.env.example` to a new file named `.env`, and paste those two values in:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```
   `.env` is already in `.gitignore` — it will never get committed to GitHub. `.env.example` (with fake values) is the only one that should be committed, so anyone else pulling the repo knows what variables they need.

By default, Supabase requires email confirmation before a new account can sign in. For testing, you can turn this off: **Authentication → Providers → Email → toggle off "Confirm email"**. You can turn it back on later before sharing this with real users.

## Run it locally

    npm install
    npm run dev

Open the local address it prints (usually `http://localhost:5173`). Sign up for an account, and you're in.

## Deploying

If you're deploying to Vercel (or similar), add the same two environment variables in your hosting provider's dashboard (Project Settings → Environment Variables) — `.env` never gets uploaded, so the live site needs them set there separately.
