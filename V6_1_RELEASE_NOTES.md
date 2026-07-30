# Bubble V6.1 Release Notes

## Completed
- Hardened raw OpenAI Responses API structured-output parsing.
- Preserved chat messages when the AI provider fails.
- Verified Supabase chat/day schemas and row-level security.
- Backfilled Bubble Days for July 26, 28, 29, and partial July 30; preserved July 27.
- Added installable PWA metadata and PNG icons for iPhone/Android home screens.
- Added a production service worker with network-first behavior.
- Added `.env.example` and `.gitignore` for GitHub/Vercel.
- Automated tests: 6 passed.

## Environment variables required in Vercel
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY
- OPENAI_MODEL (optional; defaults to gpt-5-mini)

## Validation note
The local build runner could not download `@supabase/supabase-js` because its internal package mirror returned 404. This is an environment limitation, not a source-code failure. Vercel's deployment build is the final build verification step.
