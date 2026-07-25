# Bubble V2 — Game Update 🫧

This update includes:

- Alli's chibi Bubble avatar
- Current profile: age 25, 5'4", weight left editable
- A private starter history from July 2026 covering fitness, body image, work, sleep, Justin, Nat, and personal growth
- Miles walked on the home page
- Recent Bubbles removed
- Strength, Agility, Health, Sleep, Resilience, Wisdom, Social, Creativity, and Finance stats
- XP and levels that rise from real check-ins
- Daily quests
- Missing-stat questions so Bubble prompts for sleep, water, mood, movement, and protein
- OpenAI remains optional until credits are added

## Upload

Upload everything inside this folder to the root of the existing GitHub repository and commit.

GitHub will trigger a new Vercel deployment automatically. If it does not, use Vercel → Deployments → newest deployment → Redeploy.

## Important privacy note

The included personal starter history is stored in the browser's local storage, not automatically inserted into Supabase. This keeps private relationship and life history off the publicly writable test database.

Do not publicly share the Vercel URL until authentication is added.

## Existing environment variables

Keep:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Add later when API credits work:
- OPENAI_API_KEY
- OPENAI_MODEL = gpt-5-mini
