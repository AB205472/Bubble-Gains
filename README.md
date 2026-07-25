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

## V2.5 update
- Home uses a two-column desktop layout: stats on the left, check-in and today's totals on the right.
- Restores today's totals and calculates the day using America/Chicago (Arkansas Central Time).
- Adds a live Arkansas Central date and clock.
- Uses Baloo 2 for whimsical headers and Nunito for body text.
- Keeps clickable stat source breakdowns.
- Replaces the previous avatar with a new polished Bubble mascot.

## V2.6 scoring audit
- Every overall stat now starts at 0.
- Home scores and clickable source breakdowns use the same shared calculation function, so they cannot drift apart.
- Strength no longer receives points from generic workout minutes or walking.
- Squats are no longer double-counted as both squats and strength reps.
- Agility uses only miles, steps, flights, or explicitly timed cardio/movement.
- Health uses only documented protein thresholds, produce servings, and hydration thresholds.
- Sleep never loses points; it rises from recorded sleep and documented sleep quality.
- Creativity no longer increases from generic fun entries.
- Existing built-in seed records are replaced with corrected records while preserving entries the user added.
- Entries with exercise types but no documented counts or duration remain visible in History but do not create invented stat points.

## V2.7 update
- Removes the avatar completely.
- Cleans up the Home layout and condenses the level/date/memory overview.
- Adds a clickable Memories tab with folders for every Bubble.
- Makes the total memory count clickable.
- Makes each memory clickable for its complete text, stats, encouragement, date, and Bubble tags.
- Keeps memories visible inside their related Bubble history.
- Adds exact starter questions for every stat still at 0.
- Empty stats no longer leave the user guessing what to log.

## V2.8 update
- Wisdom is now only lessons, facts learned, and patterns noticed.
- Routine workouts, meals, moods, and ordinary events no longer increase Wisdom.
- Resilience is now based only on actual coping, recovery, and boundary actions.
- Creativity is based only on specific creative actions.
- Adds rare Milestones and threshold-based Achievements as separate systems.
- Recalculates all built-in history using explicit lessons, patterns, actions, and milestones.
- Updates clickable source breakdowns to show the exact lesson, fact, pattern, action, or behavior that earned each point.
- Adds Cherry Bomb One headers, clouds, hearts, smiley faces, butterflies, flowers, sparkles, and soft background decorations.
