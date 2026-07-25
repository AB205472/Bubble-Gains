# Bubble V1 🫧

**Live your life. Bubble organizes it.**

This first usable build includes natural-language logging, AI calorie/protein estimates, workout extraction, automatic Bubble categories, daily totals, Supabase history, questions about history, and an installable mobile layout.

## 1. Upload to GitHub

Unzip this download. On GitHub's upload page, drag **everything inside the Bubble-V1 folder** onto the page, then commit the files.

## 2. Add the Bubble table in Supabase

Open your Bubble Gains project → **SQL Editor** → **New query**. Paste all of `supabase.sql` and click **Run**.

This adds a `bubbles` table. It does not delete `daily_logs` or `user_progress`.

## 3. Add Vercel environment variables

Open Vercel → Bubble-Gains → **Settings** → **Environment Variables** and add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- Optional: `OPENAI_MODEL` = `gpt-5-mini`

Use the Supabase **Project URL** and **publishable key**. Never use the Supabase secret/service-role key in a public variable.

Redeploy after saving the variables.

## 4. Test it

Paste this into Bubble:

> green tea, most of a pork sandwich, two cookies, walked a mile and did 100 squats. today was kind of weird but I still showed up.

Bubble should summarize it, estimate food, extract squats, categorize it, encourage you, and save it.

## V1 privacy note

The included database policies are intentionally simple for one-user testing. Do not share the live URL publicly yet. Authentication can be added after the mechanics feel right.
