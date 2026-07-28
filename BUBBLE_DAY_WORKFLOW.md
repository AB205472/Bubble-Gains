# Dated Bubble Day + nutrition workflow

`bubble_days` is the canonical record for one calendar day.

- One row per user and date.
- `status = draft` while the day is being updated.
- `status = final` after the nightly check-in.
- Re-pushing the same date updates the row instead of creating duplicates.
- `nutrition` stores estimated calories, protein, carbs, fat, produce, added sugar, caffeine, confidence, goals, and maintenance assumptions.
- `calorie_status` stores deficit, maintenance, surplus, or unknown.
- Bubble estimates nutrition from ordinary food updates. Exact labels, brands, and restaurant items increase confidence.
- The user can override the automatic calorie status from the daily dashboard.
- Estimates are guidance and are intentionally displayed with confidence labels rather than as exact facts.
