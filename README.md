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


## V2.1 update
- Every Bubble card is clickable.
- Each Bubble has a motivational written overview, relevant stats, direct update box, and recent history.
- Avatar is larger, round-profile style, animated on hover, and cycles motivational messages when clicked.

## V2.2 update
- Restores the original avatar from the earlier Bubble build.
- Removes the separate Stats tab.
- Moves the full level, avatar, XP, stats, and lifetime overview onto the Home page.
- Keeps Bubbles and History as their own tabs.

## V2.3 update
- Every overall stat is clickable.
- Each stat opens a source breakdown showing the exact history entries and activities that contributed.
- Shows the base score, raw logged progress, and displayed score.
- Keeps the original cute avatar restored in V2.2.
- Home and Stats remain combined.
