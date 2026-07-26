# Bubble V3.1 — Private Cloud Bubble 🫧

This version connects Bubble to the private Supabase database and requires the Supabase user login before showing personal information.

## What changed

- Added a private email/password login screen.
- Loads memories from the authenticated user's Supabase account.
- Migrates the built-in starter history into Supabase on the first successful login.
- Saves new check-ins to the `memories` table.
- Deletes memories from both the screen and Supabase.
- Keeps local storage as a temporary backup if a cloud write fails.
- Preserves the existing Bubble design, stats, quests, memories, and history views.

## Upload to GitHub

1. In the Bubble-Gains repository, choose **Add file → Upload files**.
2. Drag every file and folder from this package into the upload box.
3. Confirm replacement of existing files when GitHub shows matching names.
4. Commit directly to the main branch.
5. Vercel should deploy automatically.

## Required Vercel environment variables

These should already exist from the earlier setup:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional for smarter natural-language parsing and history questions:

- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-5-mini`

Without an OpenAI key, regular check-ins still save using Bubble's built-in basic parser.
